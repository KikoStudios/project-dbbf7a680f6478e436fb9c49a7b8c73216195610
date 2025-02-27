import { BlobServiceClient } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const client = BlobServiceClient.fromConnectionString(process.env.VITE_BLOB_READ_WRITE_TOKEN || '');

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    const gameCode = request.query.gameCode as string;
    if (!gameCode) {
      return response.status(400).json({ error: 'Game code is required' });
    }

    const containerClient = client.getContainerClient('games');
    const blobClient = containerClient.getBlobClient(`${gameCode}.json`);
    
    try {
      const blob = await blobClient.download();
      if (!blob) {
        return response.status(404).json({ error: 'Game not found' });
      }

      const text = await blob.text();
      const data = JSON.parse(text);
      
      response.setHeader('Cache-Control', 'no-store');
      return response.status(200).json(data);
    } catch (error) {
      return response.status(404).json({ error: 'Game not found' });
    }
  } catch (error) {
    console.error('Error fetching game state:', error);
    return response.status(500).json({ 
      error: 'Failed to fetch game state',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 