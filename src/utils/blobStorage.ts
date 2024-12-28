import { BlobServiceClient } from '@vercel/blob';
import { GameState } from '../types';

const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;
const client = BlobServiceClient.fromConnectionString(token || '');

export async function saveGameState(gameCode: string, state: GameState): Promise<void> {
  try {
    const containerClient = client.getContainerClient('games');
    const blobClient = containerClient.getBlobClient(`${gameCode}.json`);
    await blobClient.upload(JSON.stringify(state), {
      access: 'public',
      addRandomSuffix: false
    });
  } catch (error) {
    console.error('Error saving game state:', error);
    // Fallback to localStorage for development
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(state));
    }
  }
}

export async function getGameState(gameCode: string): Promise<GameState | null> {
  try {
    const containerClient = client.getContainerClient('games');
    const blobClient = containerClient.getBlobClient(`${gameCode}.json`);
    const response = await blobClient.download();
    
    if (!response) return null;
    
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error getting game state:', error);
    // Fallback to localStorage for development
    if (process.env.NODE_ENV === 'development') {
      const state = localStorage.getItem(`game_${gameCode}`);
      return state ? JSON.parse(state) : null;
    }
    return null;
  }
}

export async function deleteGameState(gameCode: string): Promise<void> {
  try {
    const containerClient = client.getContainerClient('games');
    const blobClient = containerClient.getBlobClient(`${gameCode}.json`);
    await blobClient.delete();
  } catch (error) {
    console.error('Error deleting game state:', error);
    // Fallback to localStorage for development
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem(`game_${gameCode}`);
    }
  }
} 