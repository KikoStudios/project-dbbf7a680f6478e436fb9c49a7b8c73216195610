import { put, list, del } from '@vercel/blob';
import { GameState } from '../types';

const token = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;

export async function saveGameState(gameCode: string, state: GameState): Promise<void> {
  try {
    await put(`games/${gameCode}.json`, JSON.stringify(state), {
      access: 'public',
      addRandomSuffix: false,
      token
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
    const { blobs } = await list({ prefix: `games/${gameCode}.json`, token });
    if (!blobs.length) return null;
    
    const response = await fetch(blobs[0].url);
    if (!response.ok) return null;
    
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
    await del(`games/${gameCode}.json`, { token });
  } catch (error) {
    console.error('Error deleting game state:', error);
    // Fallback to localStorage for development
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem(`game_${gameCode}`);
    }
  }
} 