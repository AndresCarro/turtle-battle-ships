function generateUniqueId(): string {
  const timestamp = Date.now().toString(36); // Convert timestamp to base-36
  const randomPart = Math.random().toString(36).substring(2, 8); // Random base-36 string
  return `${timestamp}-${randomPart}`;
}
