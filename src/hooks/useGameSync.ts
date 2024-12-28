import { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getGameState, saveGameState } from '../utils/blobStorage';
import { isGameExpired } from '../utils/gameUtils';

export const useGameSync = () => {
  const { state, dispatch } = useGame();
  const lastUpdateRef = useRef(state.lastStateUpdate);
  const params = new URLSearchParams(window.location.search);
  const gameCode = params.get('code')?.toUpperCase();
  const playerId = params.get('playerId');

  // Sync game state with Blob storage
  useEffect(() => {
    if (!gameCode) return;

    const syncState = async () => {
      const storedState = await getGameState(gameCode);
      if (storedState && storedState.lastStateUpdate > lastUpdateRef.current) {
        dispatch({ 
          type: 'SET_INITIAL_STATE', 
          payload: storedState 
        });
        lastUpdateRef.current = storedState.lastStateUpdate;
      }
    };

    // Initial sync
    syncState();

    // Set up interval for continuous sync
    const syncInterval = setInterval(async () => {
      await syncState();

      // Update activity timestamp without triggering a full state update
      const timestamp = Date.now();
      if (playerId) {
        dispatch({ 
          type: 'SET_PLAYER_ACTIVE',
          payload: { playerId, timestamp } 
        });
      }

      // Check for game expiration
      if (state.gameStatus === 'active' && isGameExpired(state.hostLastActive)) {
        dispatch({ type: 'CANCEL_GAME' });
        alert('Game cancelled due to host inactivity');
      }
    }, 1000);

    return () => clearInterval(syncInterval);
  }, [gameCode, playerId, dispatch]);

  // Save state changes to Blob storage
  useEffect(() => {
    const saveState = async () => {
      if (gameCode && state.lastStateUpdate > lastUpdateRef.current) {
        await saveGameState(gameCode, state);
        lastUpdateRef.current = state.lastStateUpdate;
      }
    };

    saveState();
  }, [state, gameCode]);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!playerId) return;

      if (document.hidden) {
        dispatch({ 
          type: 'SET_PLAYER_INACTIVE',
          payload: { playerId }
        });
      } else {
        dispatch({ 
          type: 'SET_PLAYER_ACTIVE',
          payload: { playerId }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, playerId]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (playerId) {
        dispatch({ 
          type: 'SET_PLAYER_INACTIVE',
          payload: { playerId }
        });
      }
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the game?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dispatch, playerId]);
};