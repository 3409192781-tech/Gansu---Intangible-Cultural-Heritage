require('dotenv').config();
const qiniu = require('qiniu');

const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_AK,
  process.env.QINIU_SK
);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_as0;
config.useHttpsDomain = true;

const bucket = process.env.QINIU_BUCKET;
const key = 'gansu-backend.tar.gz';
const filePath = './gansu-backend.tar.gz';

const options = {
  scope: bucket + ':' + key,
  expires: 3600
};

const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

formUploader.putFile(uploadToken, key, filePath, putExtra, (respErr, respBody, respInfo) => {
  if (respErr) {
    console.error('Error:', respErr);
    return;
  }
  if (respInfo.statusCode === 200) {
    console.log('上传成功!');
    console.log('文件地址:', process.env.QINIU_DOMAIN + '/' + key);
  } else {
    console.log('HTTP Status:', respInfo.statusCode);
    console.log('Response:', JSON.stringify(respBody));
  }
});