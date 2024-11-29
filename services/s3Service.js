import fs from "fs";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (filePath, fileName, fileType) => {
  const fileStream = fs.createReadStream(filePath);
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
    ContentType: fileType,
    ACL: "public-read",
  };

  await s3Client.send(new PutObjectCommand(params));
};

export const deleteFromS3 = async (keys) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
    },
  };

  await s3Client.send(new DeleteObjectsCommand(params));
};
