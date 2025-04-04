export async function migrate(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('Please set DATABASE_URL environment variable.');
  }
}
