const BUCKET_NAME = 'sauravbucket01';

const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')

const s3 = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: "AKIA4B3EVR74XAA3FIWU",
        secretAccessKey: "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"
      }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString()+file.originalname);
    }
  })
})

module.exports = {upload};