const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/response');

var genOrderNo = function () {
  var now = new Date();
  var y = now.getFullYear().toString().slice(-2);
  var M = (now.getMonth() + 1).toString().padStart(2, '0');
  var d = now.getDate().toString().padStart(2, '0');
  var h = now.getHours().toString().padStart(2, '0');
  var m = now.getMinutes().toString().padStart(2, '0');
  var s = now.getSeconds().toString().padStart(2, '0');
  var rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'GS' + y + M + d + h + m + s + rand;
};

// 增减库存
var changeStock = async function (productId, delta) {
  var p = await Product.findOne({ id: productId });
  if (p) {
    p.stock = Math.max(0, (p.stock || 0) + delta);
    await p.save();
  }
};

// 增减销量
var changeSold = async function (productId, delta) {
  var p = await Product.findOne({ id: productId });
  if (p) {
    p.sold = Math.max(0, (p.sold || 0) + delta);
    await p.save();
  }
};

// ==========================================
// 公开 - 创建订单
// ==========================================
router.post('/', async function (req, res) {
  try {
    var body = req.body;
    if (!body.productId || !body.productName || !body.price || !body.customerName || !body.customerPhone || !body.customerAddress) {
      return res.status(400).json(error('请填写完整的订单信息', 400));
    }

    // 检查库存
    var product = await Product.findOne({ id: body.productId });
    if (!product) {
      return res.status(400).json(error('产品不存在', 400));
    }
    if ((product.stock || 0) <= 0) {
      return res.status(400).json(error('该产品已售罄', 400));
    }

    // 扣库存
    product.stock -= 1;
    await product.save();

    var order = await Order.create({
      orderNo: genOrderNo(),
      productId: body.productId,
      productName: body.productName,
      productImage: body.productImage || '',
      price: body.price,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      deviceId: body.deviceId || '',
      status: 'pending'
    });

    res.json(success(order, '下单成功'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 公开 - 用户订单列表（按 deviceId 查询）
// ==========================================
router.get('/my', async function (req, res) {
  try {
    var deviceId = req.query.deviceId;
    if (!deviceId) {
      return res.status(400).json(error('缺少 deviceId', 400));
    }

    var page = parseInt(req.query.page, 10) || 1;
    var pageSize = parseInt(req.query.pageSize, 10) || 20;
    var status = req.query.status;
    var filter = { deviceId: deviceId };
    if (status && status !== 'all') filter.status = status;

    var total = await Order.countDocuments(filter);
    var orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json(success({ list: orders, total: total, page: page, pageSize: pageSize }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 管理端订单列表（分页 + 状态筛选）
// ==========================================
router.get('/', protect, async function (req, res) {
  try {
    var page = parseInt(req.query.page, 10) || 1;
    var pageSize = parseInt(req.query.pageSize, 10) || 20;
    var status = req.query.status;
    var keyword = req.query.keyword;
    var filter = {};
    if (status && status !== 'all') filter.status = status;
    if (keyword) {
      filter.$or = [
        { orderNo: { $regex: keyword, $options: 'i' } },
        { productName: { $regex: keyword, $options: 'i' } },
        { customerName: { $regex: keyword, $options: 'i' } },
        { customerPhone: { $regex: keyword, $options: 'i' } }
      ];
    }

    var total = await Order.countDocuments(filter);
    var orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json(success({ list: orders, total: total, page: page, pageSize: pageSize }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 订单统计
// ==========================================
router.get('/stats', protect, async function (req, res) {
  try {
    var total = await Order.countDocuments();
    var pending = await Order.countDocuments({ status: 'pending' });
    var paid = await Order.countDocuments({ status: 'paid' });
    var shipped = await Order.countDocuments({ status: 'shipped' });
    var refunding = await Order.countDocuments({ status: 'refunding' });
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var todayCount = await Order.countDocuments({ createdAt: { $gte: today } });

    res.json(success({ total: total, pending: pending, paid: paid, shipped: shipped, refunding: refunding, todayCount: todayCount }));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 订单详情
// ==========================================
router.get('/:id', protect, async function (req, res) {
  try {
    var order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(error('订单不存在', 404));
    res.json(success(order));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 修改订单状态（管理端）
// ==========================================
router.put('/:id/status', protect, async function (req, res) {
  try {
    var newStatus = req.body.status;
    var validStatuses = ['paid', 'shipped', 'completed', 'cancelled'];
    if (validStatuses.indexOf(newStatus) === -1) {
      return res.status(400).json(error('无效状态', 400));
    }

    var order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(error('订单不存在', 404));

    var oldStatus = order.status;

    // 状态流转校验
    if (newStatus === 'paid' && oldStatus !== 'pending') {
      return res.status(400).json(error('只有待付款订单可以标记为已付款', 400));
    }
    if (newStatus === 'shipped' && oldStatus !== 'paid') {
      return res.status(400).json(error('只有已付款订单可以发货', 400));
    }
    if (newStatus === 'completed' && oldStatus !== 'shipped') {
      return res.status(400).json(error('只有已发货订单可以标记为完成', 400));
    }
    if (newStatus === 'cancelled' && oldStatus !== 'pending' && oldStatus !== 'paid') {
      return res.status(400).json(error('当前状态不可取消', 400));
    }

    // 取消时退还库存
    if (newStatus === 'cancelled') {
      await changeStock(order.productId, 1);
    }

    // 付款时增加销量
    if (newStatus === 'paid' && oldStatus === 'pending') {
      await changeSold(order.productId, 1);
      order.paidAt = new Date();
    }

    if (newStatus === 'shipped') {
      order.shippedAt = new Date();
      if (req.body.logistics) order.logistics = req.body.logistics;
      if (req.body.logisticsCompany) order.logisticsCompany = req.body.logisticsCompany;
    }

    order.status = newStatus;
    await order.save();

    var labels = { paid: '已标记付款', shipped: '已标记发货', completed: '已完成', cancelled: '已取消' };
    res.json(success(order, labels[newStatus] || '状态已更新'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 修改物流信息（管理端 — 允许修改已发货订单的物流单号）
// ==========================================
router.put('/:id/logistics', protect, async function (req, res) {
  try {
    var order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(error('订单不存在', 404));
    if (order.status !== 'shipped' && order.status !== 'completed') {
      return res.status(400).json(error('只有已发货/已完成的订单可以修改物流信息', 400));
    }

    if (req.body.logistics !== undefined) order.logistics = req.body.logistics;
    if (req.body.logisticsCompany !== undefined) order.logisticsCompany = req.body.logisticsCompany;
    await order.save();

    res.json(success(order, '物流信息已更新'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 保护 - 处理退款（管理端）
// ==========================================
router.put('/:id/refund-handle', protect, async function (req, res) {
  try {
    var action = req.body.action; // 'approved' or 'rejected'
    if (action !== 'approved' && action !== 'rejected') {
      return res.status(400).json(error('无效操作', 400));
    }

    var order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(error('订单不存在', 404));
    if (order.status !== 'refunding') {
      return res.status(400).json(error('该订单未申请退款', 400));
    }

    order.refundStatus = action;
    order.refundedAt = new Date();

    if (action === 'approved') {
      order.status = 'cancelled';
      // 退还库存和销量
      await changeStock(order.productId, 1);
      await changeSold(order.productId, -1);
    } else {
      // 拒绝退款，恢复到之前的状态（shipped）
      order.status = 'shipped';
    }

    await order.save();
    res.json(success(order, action === 'approved' ? '已同意退款，库存已退还' : '已拒绝退款'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 公开 - 用户取消订单（deviceId 校验）
// ==========================================
router.put('/:orderNo/cancel', async function (req, res) {
  try {
    var deviceId = req.body.deviceId;
    var order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) return res.status(404).json(error('订单不存在', 404));
    if (order.deviceId && order.deviceId !== deviceId) {
      return res.status(403).json(error('无权操作', 403));
    }
    if (order.status !== 'pending' && order.status !== 'paid') {
      return res.status(400).json(error('当前状态不可取消', 400));
    }

    // 退还库存
    await changeStock(order.productId, 1);

    order.status = 'cancelled';
    await order.save();
    res.json(success(order, '订单已取消，库存已退还'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 公开 - 用户确认收货
// ==========================================
router.put('/:orderNo/confirm', async function (req, res) {
  try {
    var deviceId = req.body.deviceId;
    var order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) return res.status(404).json(error('订单不存在', 404));
    if (order.deviceId && order.deviceId !== deviceId) {
      return res.status(403).json(error('无权操作', 403));
    }
    if (order.status !== 'shipped') {
      return res.status(400).json(error('当前状态不可确认收货', 400));
    }

    order.status = 'completed';
    await order.save();
    res.json(success(order, '已确认收货'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

// ==========================================
// 公开 - 用户申请退款
// ==========================================
router.put('/:orderNo/refund', async function (req, res) {
  try {
    var deviceId = req.body.deviceId;
    var reason = req.body.reason;
    var order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order) return res.status(404).json(error('订单不存在', 404));
    if (order.deviceId && order.deviceId !== deviceId) {
      return res.status(403).json(error('无权操作', 403));
    }
    if (order.status !== 'shipped' && order.status !== 'completed') {
      return res.status(400).json(error('当前状态不可申请退款', 400));
    }
    if (order.refundStatus === 'pending') {
      return res.status(400).json(error('已有退款申请在处理中', 400));
    }

    order.refundReason = reason || '';
    order.refundStatus = 'pending';
    order.status = 'refunding';
    await order.save();
    res.json(success(order, '退款申请已提交'));
  } catch (err) {
    res.status(500).json(error('操作失败，请稍后重试'));
  }
});

module.exports = router;
