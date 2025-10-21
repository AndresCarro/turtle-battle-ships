import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from '@aws-sdk/client-s3';

// Use different configuration based on environment
const isProduction = process.env.NODE_ENV === 'production';
const region = process.env.REGION || 'us-east-1';

const s3Config: any = {
  region,
};

// Only use custom endpoint and credentials in local development
if (!isProduction && process.env.BUCKET_ENDPOINT) {
  s3Config.endpoint = process.env.BUCKET_ENDPOINT;
  s3Config.credentials = {
    accessKeyId: process.env.BUCKET_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY || 'minioadmin',
  };
  s3Config.forcePathStyle = true;
}

export const s3 = new S3Client(s3Config);

export const REPLAYS_BUCKET_NAME =
  process.env.BUCKET_NAME || 'battleshipgamereplays';

export async function createBucketIfNeeded() {
  // Skip bucket creation in production (bucket should be managed by Terraform)
  if (isProduction) {
    console.log(
      `ℹ️  Production mode: Skipping bucket creation. Bucket ${REPLAYS_BUCKET_NAME} should be managed by Terraform.`
    );
    return;
  }

  try {
    await s3.send(new HeadBucketCommand({ Bucket: REPLAYS_BUCKET_NAME }));
    console.log(`ℹ️  Bucket ${REPLAYS_BUCKET_NAME} already exists`);
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: REPLAYS_BUCKET_NAME }));
    console.log(`✅ Bucket ${REPLAYS_BUCKET_NAME} created`);

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${REPLAYS_BUCKET_NAME}/*`],
        },
      ],
    };
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: REPLAYS_BUCKET_NAME,
        Policy: JSON.stringify(policy),
      })
    );
  }
}
