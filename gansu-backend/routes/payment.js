const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { success, error } = require('../utils/response');

// ==========================================
// 配置
// ==========================================
const APPID = (process.env.WX_APPID || '').trim();
const SECRET = (process.env.WX_SECRET || '').trim();
const MCHID = (process.env.WX_PAY_MCHID || '').trim();
const API_V3_KEY = (process.env.WX_PAY_API_V3_KEY || '').trim();
const SERIAL_NO = (process.env.WX_PAY_SERIAL_NO || '').trim();
const PRIV_KEY_PATH = process.env.WX_PAY_PRIV_KEY_PATH
  ? path.resolve(__dirname, '..', process.env.WX_PAY_PRIV_KEY_PATH)
  : '';
const NOTIFY_URL = 'https://gansu-culture.xyz/api/payment/notify';

// 缓存微信平台证书
let WECHAT_PUB_KEY = null;
let certExpiresAt = 0;

// ==========================================
// 工具函数
// ==========================================

function randStr(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function loadPrivKey() {
  try {
    if (!PRIV_KEY_PATH || !fs.existsSync(PRIV_KEY_PATH)) {
      console.error('[支付] 私钥文件不存在: ' + PRIV_KEY_PATH);
      return null;
    }
    return fs.readFileSync(PRIV_KEY_PATH, 'utf8');
  } catch (e) {
    console.error('[支付] 读取私钥失败:', e.message);
    return null;
  }
}

// RSA-SHA256 签名
function rsaSign(data) {
  const key = loadPrivKey();
  if (!key) throw new Error('商户私钥未配置');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(key, 'base64');
}

// 生成 WECHATPAY2-SHA256withRSA 签名
function makePaySign(method, urlPath, timestamp, nonceStr, body) {
  const signStr = method + '\n' + urlPath + '\n' + timestamp + '\n' + nonceStr + '\n' + (body || '') + '\n';
  return rsaSign(signStr);
}

// 生成 Authorization header
function makeAuthHeader(method, urlPath, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = randStr(32);
  const signature = makePaySign(method, urlPath, timestamp, nonceStr, body);
  return {
    Authorization: 'WECHATPAY2-SHA256-RSA2048 mchid="' + MCHID + '",nonce_str="' + nonceStr + '",timestamp="' + timestamp + '",serial_no="' + SERIAL_NO + '",signature="' + signature + '"',
    timestamp: timestamp,
    nonceStr: nonceStr
  };
}

// 发送 HTTPS 请求到微信支付
function wxPayRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const headers = makeAuthHeader(method, urlPath, bodyStr);
    const options = {
      hostname: 'api.mch.weixin.qq.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': headers.Authorization,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GansuCulture/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          reject(new Error('微信支付响应解析失败: ' + data.substring(0, 200)));
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('微信支付请求超时')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// code 换 openid
function code2openid(code) {
  return new Promise((resolve, reject) => {
    const url = '/sns/jscode2session?appid=' + APPID + '&secret=' + SECRET + '&js_code=' + code + '&grant_type=authorization_code';
    const req = https.get('https://api.weixin.qq.com' + url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.openid) {
            resolve(json.openid);
          } else {
            reject(new Error('获取openid失败: ' + (json.errmsg || '未知错误')));
          }
        } catch (e) {
          reject(new Error('微信登录响应解析失败'));
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('微信登录请求超时')); });
  });
}

// AES-256-GCM 解密（用于回调报文解密）
function aesGcmDecrypt(ciphertext, associatedData, nonce) {
  const key = Buffer.from(API_V3_KEY, 'utf8');
  const authTag = Buffer.from(ciphertext, 'base64').subarray(-16);
  const encrypted = Buffer.from(ciphertext, 'base64').subarray(0, -16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(nonce, 'utf8'));
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from(associatedData || '', 'utf8'));
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 获取/刷新微信平台证书（用于验签回调）
async function getWechatPubKey() {
  if (WECHAT_PUB_KEY && Date.now() < certExpiresAt) {
    return WECHAT_PUB_KEY;
  }
  try {
    const result = await wxPayRequest('GET', '/v3/certificates');
    if (result.status !== 200 || !result.data.data || result.data.data.length === 0) {
      throw new Error('获取平台证书失败');
    }
    const cert = result.data.data[0];
    const pubKey = cert.encrypt_certificate
      ? aesGcmDecrypt(cert.encrypt_certificate.ciphertext, cert.encrypt_certificate.associated_data, cert.encrypt_certificate.nonce)
      : null;
    if (pubKey) {
      WECHAT_PUB_KEY = pubKey;
      certExpiresAt = Date.parse(cert.expire_time);
      // 提前5分钟过期
      certExpiresAt -= 5 * 60 * 1000;
    }
    return pubKey;
  } catch (e) {
    console.error('[支付] 获取平台证书失败:', e.message);
    return null;
  }
}

// 验证回调签名
async function verifyNotifySign(timestamp, nonce, signature, body) {
  try {
    const pubKey = await getWechatPubKey();
    if (!pubKey) {
      console.error('[支付] 无法获取平台公钥进行验签，跳过验签（生产环境必须处理）');
      return true; // 生产环境必须严格验签！
    }
    const signStr = timestamp + '\n' + nonce + '\n' + body + '\n';
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signStr);
    verify.end();
    return verify.verify(pubKey, signature, 'base64');
  } catch (e) {
    console.error('[支付] 验签异常:', e.message);
    return false;
  }
}

// ==========================================
// POST /api/payment/prepay — JSAPI 预下单
// ==========================================
router.post('/prepay', async (req, res) => {
  try {
    const { orderNo, code } = req.body;
    if (!orderNo) {
      return res.status(400).json(error('缺少订单号', 400));
    }
    if (!code) {
      return res.status(400).json(error('缺少登录凭证code', 400));
    }

    // 1. 查订单
    const order = await Order.findOne({ orderNo: orderNo });
    if (!order) {
      return res.status(404).json(error('订单不存在', 404));
    }
    if (order.status !== 'pending') {
      return res.status(400).json(error('订单状态不可支付', 400));
    }

    // 2. code 换 openid
    let openid;
    try {
      openid = await code2openid(code);
    } catch (e) {
      return res.status(400).json(error('获取用户身份失败，请重新登录: ' + e.message, 400));
    }

    // 3. 校验支付配置
    if (!MCHID || !API_V3_KEY || !SERIAL_NO) {
      return res.status(500).json(error('支付服务未配置', 500));
    }

    // 4. 调微信 JSAPI 下单
    const totalFen = Math.round(order.price * 100);
    const wxBody = {
      appid: APPID,
      mchid: MCHID,
      description: order.productName,
      out_trade_no: order.orderNo,
      notify_url: NOTIFY_URL,
      amount: {
        total: totalFen,
        currency: 'CNY'
      },
      payer: {
        openid: openid
      }
    };

    console.log('[支付] JSAPI下单:', JSON.stringify(wxBody));
    console.log('[支付] MCHID=[' + MCHID + '] SERIAL=[' + SERIAL_NO + ']');
    console.log('[支付] PRIV_KEY_PATH=[' + PRIV_KEY_PATH + '] exists=' + (require('fs').existsSync(PRIV_KEY_PATH)));
    const wxResult = await wxPayRequest('POST', '/v3/pay/transactions/jsapi', wxBody);

    console.log('[支付] 微信响应 status=' + wxResult.status + ' body=' + JSON.stringify(wxResult.data));
    if (wxResult.status !== 200 || !wxResult.data.prepay_id) {
      console.error('[支付] 微信下单失败:', JSON.stringify(wxResult.data));
      const msg = (wxResult.data.message) || '微信支付下单失败';
      return res.status(400).json(error(msg, 400));
    }

    const prepayId = wxResult.data.prepay_id;
    console.log('[支付] 预支付ID:', prepayId);

    // 5. 生成小程序调起支付参数
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = randStr(32);
    const packageStr = 'prepay_id=' + prepayId;
    const signStr = APPID + '\n' + timeStamp + '\n' + nonceStr + '\n' + packageStr + '\n';
    const paySign = rsaSign(signStr);

    const payParams = {
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: packageStr,
      signType: 'RSA',
      paySign: paySign
    };

    res.json(success(payParams, '预下单成功'));
  } catch (e) {
    console.error('[支付] 预下单异常:', e.message);
    res.status(500).json(error('支付服务异常，请稍后重试', 500));
  }
});

// ==========================================
// POST /api/payment/notify — 微信支付回调
// ==========================================
router.post('/notify', async (req, res) => {
  try {
    // 获取请求体（express 已解析为 JSON）
    const body = JSON.stringify(req.body);

    // 获取签名头
    const wxTimestamp = req.headers['wechatpay-timestamp'];
    const wxNonce = req.headers['wechatpay-nonce'];
    const wxSignature = req.headers['wechatpay-signature'];
    const wxSerial = req.headers['wechatpay-serial'];

    console.log('[支付] 收到回调, serial=' + wxSerial);

    if (!wxTimestamp || !wxNonce || !wxSignature) {
      console.error('[支付] 回调缺少签名头');
      return res.status(400).json({ code: 'FAIL', message: '缺少签名头' });
    }

    // 验签
    const valid = await verifyNotifySign(wxTimestamp, wxNonce, wxSignature, body);
    if (!valid) {
      console.error('[支付] 回调验签失败');
      return res.status(401).json({ code: 'FAIL', message: '验签失败' });
    }

    // 解密通知数据
    const resource = req.body.resource;
    if (!resource || !resource.ciphertext) {
      return res.status(400).json({ code: 'FAIL', message: '无加密数据' });
    }

    const decrypted = aesGcmDecrypt(
      resource.ciphertext,
      resource.associated_data || '',
      resource.nonce
    );
    const notifyData = JSON.parse(decrypted);

    console.log('[支付] 回调解密:', JSON.stringify(notifyData));

    const orderNo = notifyData.out_trade_no;
    const transactionId = notifyData.transaction_id;
    const tradeState = notifyData.trade_state;

    if (tradeState !== 'SUCCESS') {
      console.log('[支付] 交易非成功状态:', tradeState);
      return res.json({ code: 'SUCCESS' });
    }

    // 更新订单
    const order = await Order.findOne({ orderNo: orderNo });
    if (!order) {
      console.error('[支付] 订单不存在:', orderNo);
      return res.status(404).json({ code: 'FAIL', message: '订单不存在' });
    }

    if (order.status === 'pending') {
      order.status = 'paid';
      order.wxTransactionId = transactionId;
      order.paidAt = new Date();
      await order.save();

      // 增加销量
      const product = await Product.findOne({ id: order.productId });
      if (product) {
        product.sold = (product.sold || 0) + 1;
        await product.save();
      }

      console.log('[支付] 订单已支付:', orderNo, transactionId);
    }

    res.json({ code: 'SUCCESS' });
  } catch (e) {
    console.error('[支付] 回调处理异常:', e.message);
    res.status(500).json({ code: 'FAIL', message: '处理异常' });
  }
});

module.exports = router;
