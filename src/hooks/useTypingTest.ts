import { useState, useEffect, useCallback, useRef } from 'react';
import { Passage, generateTypingTestText, fetchBookPassage } from '../data/passages';

export type CharState = 'pending' | 'correct' | 'incorrect' | 'current';

export interface TypingState {
  passage: Passage;
  typed: string;
  charStates: CharState[];
  started: boolean;
  finished: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  wpm: number;
  accuracy: number;
  errors: number;
}

export function useTypingTest(testMode: 'typing-test' | 'passages' = 'passages') {
  const [passage, setPassage] = useState<Passage>(() => {
    if (testMode === 'typing-test') {
      return {
        id: 1,
        title: 'Typing Test',
        text: generateTypingTestText(),
        difficulty: 'easy',
      };
    }
    return {
      id: 0,
      title: 'Loading passage...',
      text: 'Loading passage...',
      difficulty: 'medium',
    };
  });
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartIdRef = useRef(0);

  const charStates: CharState[] = passage.text.split('').map((_, i) => {
    if (i >= typed.length) return 'pending';
    return typed[i] === passage.text[i] ? 'correct' : 'incorrect';
  });

  const errors = charStates.filter((s) => s === 'incorrect').length;

  const wpm = (() => {
    if (!startTime || elapsedSeconds === 0) return 0;
    const correctChars = charStates
      .slice(0, typed.length)
      .filter((s) => s === 'correct').length;
    return Math.round((correctChars / 5) / (elapsedSeconds / 60));
  })();

  const accuracy = typed.length === 0
    ? 100
    : Math.round(((typed.length - errors) / typed.length) * 100);

  useEffect(() => {
    if (started && !finished) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - (startTime ?? Date.now())) / 1000));
      }, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, finished, startTime]);

  const handleInput = useCallback(
    (value: string) => {
      if (finished) return;
      if (!started && value.length > 0) {
        setStarted(true);
        setStartTime(Date.now());
      }
      
      if (testMode === 'typing-test') {
        setTyped(value);
        if (value.length > passage.text.length - 20) {
          setPassage((prev) => ({
            ...prev,
            text: prev.text + ' ' + generateTypingTestText(),
          }));
        }
      } else {
        if (value.length > passage.text.length) return;
        setTyped(value);
        if (value.length === passage.text.length) {
          setFinished(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setElapsedSeconds(Math.floor((Date.now() - (startTime ?? Date.now())) / 1000));
        }
      }
    },
    [finished, started, passage.text.length, testMode]
  );

  const restart = useCallback(async () => {
    const restartId = restartIdRef.current + 1;
    restartIdRef.current = restartId;

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    let newPassage: Passage;
    if (testMode === 'typing-test') {
      newPassage = {
        id: 1,
        title: 'Typing Test',
        text: generateTypingTestText(),
        difficulty: 'easy',
      };
    } else {
      newPassage = await fetchBookPassage();
    }

    if (restartId !== restartIdRef.current) return;
    
    setPassage(newPassage);
    setTyped('');
    setStarted(false);
    setFinished(false);
    setStartTime(null);
    setElapsedSeconds(0);
  }, [testMode]);

  const resetAttempt = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTyped('');
    setStarted(false);
    setFinished(false);
    setStartTime(null);
    setElapsedSeconds(0);
  }, []);

  useEffect(() => {
    restart();
  }, [testMode]);

  return {
    passage,
    typed,
    charStates,
    started,
    finished,
    startTime,
    elapsedSeconds,
    wpm,
    accuracy,
    errors,
    handleInput,
    restart,
    resetAttempt,
  };
}
