// backend/config/aws.js
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

exports.s3Client = s3Client;
exports.PutObjectCommand = PutObjectCommand;
exports.DeleteObjectCommand = DeleteObjectCommand;
exports.GetObjectCommand = GetObjectCommand;
exports.getSignedUrl = getSignedUrl;