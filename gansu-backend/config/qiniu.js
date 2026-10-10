const qiniu = require('qiniu');

const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_AK,
  process.env.QINIU_SK
);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2;

const bucketManager = new qiniu.rs.BucketManager(mac, config);

const uploadToken = (bucket, key) => {
  const options = {
    scope: bucket + ':' + key,
    expires: 3600
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
};

module.exports = {
  mac,
  config,
  bucketManager,
  uploadToken,
  bucket: process.env.QINIU_BUCKET,
  domain: process.env.QINIU_DOMAIN
};