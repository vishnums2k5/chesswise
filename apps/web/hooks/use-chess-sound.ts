'use client';
import { useCallback, useRef, useEffect } from 'react';

export function useChessSound() {
  const moveAudio = useRef<HTMLAudioElement | null>(null);
  const captureAudio = useRef<HTMLAudioElement | null>(null);
  const endAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      moveAudio.current = new Audio('/sounds/Move.mp3');
      captureAudio.current = new Audio('/sounds/Capture.mp3');
      endAudio.current = new Audio('/sounds/Victory.mp3');
    }
  }, []);

  const playSound = useCallback((type: 'move' | 'capture' | 'end') => {
    try {
      let audio: HTMLAudioElement | null = null;
      if (type === 'move') audio = moveAudio.current;
      else if (type === 'capture') audio = captureAudio.current;
      else if (type === 'end') audio = endAudio.current;

      if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browsers block audio before first user interaction
          });
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  return playSound;
}
