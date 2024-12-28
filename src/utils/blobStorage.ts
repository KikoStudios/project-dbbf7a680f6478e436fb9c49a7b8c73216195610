import { put, list, del } from '@vercel/blob';
import { GameState } from '../types';

// Use a client URL prefix for production
const BLOB_STORE_URL = 'https://blob.vercel-storage.com';

export async function saveGameState(gameCode: string, state: GameState): Promise<void> {
  try {
    const blob = await put(`games/${gameCode}.json`, JSON.stringify(state), {
      access: 'public',
      addRandomSuffix: false,
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
    });
    console.log('Game state saved:', blob.url); // Add logging to debug
  } catch (error) {
    console.error('Error saving game state:', error);
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(state));
    }
  }
}

export async function getGameState(gameCode: string): Promise<GameState | null> {
  try {
    // First try direct URL
    const directUrl = `${BLOB_STORE_URL}/games/${gameCode}.json`;
    try {
      const response = await fetch(directUrl);
      if (response.ok) {
        const text = await response.text();
        return JSON.parse(text);
      }
    } catch (directError) {
      console.log('Direct fetch failed, trying list method');
    }

    // Fallback to list method
    const { blobs } = await list({
      prefix: `games/${gameCode}.json`,
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
    });

    console.log('Found blobs:', blobs); // Add logging to debug

    if (!blobs.length) {
      console.log('No blobs found for game:', gameCode);
      return null;
    }

    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      console.log('Failed to fetch blob content:', response.status);
      return null;
    }

    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error getting game state:', error);
    if (process.env.NODE_ENV === 'development') {
      const state = localStorage.getItem(`game_${gameCode}`);
      return state ? JSON.parse(state) : null;
    }
    return null;
  }
}

export async function deleteGameState(gameCode: string): Promise<void> {
  try {
    await del(`games/${gameCode}.json`, {
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
    });
  } catch (error) {
    console.error('Error deleting game state:', error);
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem(`game_${gameCode}`);
    }
  }
} 