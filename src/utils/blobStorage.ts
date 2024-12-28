import { put, get, del } from '@vercel/blob';
import { GameState } from '../types';

export async function saveGameState(gameCode: string, state: GameState): Promise<void> {
  try {
    const blob = await put(`games/${gameCode}.json`, JSON.stringify(state), {
      access: 'public',
      addRandomSuffix: false
    });
    console.log('Game state saved to blob:', blob.url);
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
    const response = await get(`games/${gameCode}.json`);
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
    await del(`games/${gameCode}.json`);
  } catch (error) {
    console.error('Error deleting game state:', error);
    // Fallback to localStorage for development
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem(`game_${gameCode}`);
    }
  }
} 