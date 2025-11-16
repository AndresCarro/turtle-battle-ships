import AWS from "aws-sdk";

const BUCKET_NAME = process.env.VIDEO_REPLAYS_BUCKET_NAME;
const REGION = process.env.REGION || "us-east-1";

const s3 = new AWS.S3({
	signatureVersion: "v4",
	region: REGION,
});

/**
 * Return a presigned GET URL for an object in S3
 * @param s3Key Key/path of the object inside the bucket
 * @param expiresSeconds Expiration in seconds (default 300)
 */
export async function getPresignedUrl(
	s3Key: string,
	expiresSeconds = 900
): Promise<string> {
	if (!s3Key) throw new Error("s3Key is required");
	if (!BUCKET_NAME) throw new Error("S3_BUCKET_NAME environment variable is not set");

	const params: AWS.S3.GetObjectRequest & { Expires?: number } = {
		Bucket: BUCKET_NAME,
		Key: s3Key,
		Expires: expiresSeconds,
	} as any;

	// aws-sdk v2: getSignedUrl is synchronous and returns the URL string.
	const url = s3.getSignedUrl("getObject", params);
	return url;
}
