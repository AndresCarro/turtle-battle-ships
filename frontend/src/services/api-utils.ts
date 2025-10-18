export const API_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const S3_GAME_REPLAY_BUCKET_URL =
  import.meta.env.VITE_S3_GAME_REPLAY_BUCKET_URL ||
  'https://your-s3-bucket-url';
export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'API Error');
  }
  return res.json();
}
