import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.BUCKET_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

const bucketName = process.env.BUCKET_NAME || "game-replays";

export async function createBucketIfNeeded() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));

    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );
  }
}
