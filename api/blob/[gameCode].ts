import { get } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { gameCode } = request.query;

  try {
    const blob = await get(`games/${gameCode}.json`, {
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    if (!blob) {
      return response.status(404).json({ error: 'Game not found' });
    }

    const data = await blob.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error('Error fetching game state:', error);
    return response.status(500).json({ error: 'Failed to fetch game state' });
  }
} 