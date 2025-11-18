import { bundle } from "@remotion/bundler";
import path from "node:path";
import fs from "node:fs";
import { webpackOverride } from "./server/webpack-override";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { SQSEvent } from "aws-lambda";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

// Helper: convert Readable stream (Body from GetObject) to Buffer
const streamToBuffer = async (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err: Error) => reject(err));
  });
};

async function main(s3Key: string) {
  // If a prebuilt Remotion bundle exists in the image (e.g. produced during Docker build
  // into the `build/` folder), prefer using it to avoid bundling at runtime.
  const prebuiltBundlePath = path.resolve("build");
  let remotionBundle: string;
  if (fs.existsSync(prebuiltBundlePath)) {
    console.info("Using prebuilt Remotion bundle from:", prebuiltBundlePath);
    remotionBundle = prebuiltBundlePath;
  } else {
    remotionBundle = await bundle({
      entryPoint: path.resolve("remotion/index.ts"),
      onProgress(progress) {
        console.info(`Bundling Remotion project: ${progress}%`);
      },
      webpackOverride,
    });
  }

  const region = process.env.AWS_REGION || "us-east-1";
  const s3Client = new S3Client({ region });
  const inputBucket = process.env.INPUT_BUCKET;
  const outputBucket = process.env.OUTPUT_BUCKET || inputBucket;

  if (!inputBucket) {
    throw new Error("INPUT_S3_BUCKET environment variable is required to fetch input from S3");
  }

  const getCmd = new GetObjectCommand({ Bucket: inputBucket, Key: s3Key });
  const res = await s3Client.send(getCmd);
  if (!res.Body) {
    throw new Error("S3 object had empty body");
  }
  const buffer = await streamToBuffer(res.Body as any);
  const text = buffer.toString("utf8");
  const data = JSON.parse(text);

  const inputProps = {
    input: data
  };

  const composition = await selectComposition({
    serveUrl: remotionBundle,
    id: "battleship",
    inputProps,
  });

  const tmpOutDir = path.join("/tmp", "out");
  fs.mkdirSync(tmpOutDir, { recursive: true });
  process.chdir("/tmp");
  const outputLocation = path.join("out", "battleship.mp4");

  await renderMedia({
    serveUrl: remotionBundle,
    composition,
    inputProps,
    codec: "h264",
    onProgress: (progress) => {
      console.info(`Render progress:`, progress.progress);
    },
    outputLocation,
  });

  let outputKey = `${s3Key.split(".")[0]}.mp4`;
  const fileStream = fs.createReadStream(outputLocation);
  const putCmd = new PutObjectCommand({
    Bucket: outputBucket,
    Key: outputKey,
    Body: fileStream,
    ContentType: "video/mp4",
  });
  await s3Client.send(putCmd);
}

export async function handler(event: SQSEvent) {
  if (!event.Records || event.Records.length === 0) {
    console.warn("SQS event had no records");
    return;
  }

  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    const key = body.Records?.[0]?.s3?.object?.key;
    if (key) {
      try {
        await main(key);
      } catch (err) {
        console.error("Error processing SQS record:", err);
        throw err;
      }
    } else {
      console.warn("No S3 key found in SQS record body");
    }
  }

  // Deletion of processed messages is handled by AWS Lambda automatically
};
