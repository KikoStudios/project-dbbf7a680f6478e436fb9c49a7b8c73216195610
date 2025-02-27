import { put, del } from '@vercel/blob';
import { GameState } from '../types';

export async function saveGameState(gameCode: string, state: GameState): Promise<void> {
  try {
    const blob = await put(`games/${gameCode}.json`, JSON.stringify(state), {
      access: 'public',
      addRandomSuffix: false,
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
      contentType: 'application/json'
    });
    console.log('Game state saved:', blob.url);
  } catch (error) {
    console.error('Error saving game state:', error);
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem(`game_${gameCode}`, JSON.stringify(state));
    }
    throw error;
  }
}

export async function getGameState(gameCode: string): Promise<GameState | null> {
  try {
    const response = await fetch(`/api/blob/${gameCode}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      
      if (process.env.NODE_ENV === 'development') {
        const state = localStorage.getItem(`game_${gameCode}`);
        return state ? JSON.parse(state) : null;
      }
      return null;
    }
    
    return await response.json();
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
    throw error;
  }
} 