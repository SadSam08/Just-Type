import { useRef, useEffect, useCallback, useState } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { useTypingTest } from '../hooks/useTypingTest';
import TextDisplay from './TextDisplay';
import Results from './Results';

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-600',
};

const PACING_WPM_STORAGE_KEY = 'justtype:pacing-wpm';

const readStoredPacingWpm = (): number | null => {
  try {
    const storedValue = localStorage.getItem(PACING_WPM_STORAGE_KEY);
    if (storedValue === null) return null;

    const storedWpm = Number(storedValue);
    return Number.isFinite(storedWpm) && storedWpm > 0 ? storedWpm : null;
  } catch {
    return null;
  }
};

const saveStoredPacingWpm = (wpm: number) => {
  try {
    localStorage.setItem(PACING_WPM_STORAGE_KEY, String(wpm));
  } catch {
    // Ignore storage failures; the in-memory setting still works for this session.
  }
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

export default function TypingTest() {
  const [testMode, setTestMode] = useState<'typing-test' | 'passages'>('passages');
  const [isInputReady, setIsInputReady] = useState(false);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);
  const [isPacingFormOpen, setIsPacingFormOpen] = useState(false);
  const [pacingWpmInput, setPacingWpmInput] = useState('60');
  const [pacingWpm, setPacingWpm] = useState<number | null>(readStoredPacingWpm);
  const {
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
  } = useTypingTest(testMode);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsInputReady(false);
  }, [passage.text]);

  const handleModeChange = (newMode: 'typing-test' | 'passages') => {
    setTestMode(newMode);
  };

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const openPacingCaretForm = () => {
    setPacingWpmInput(pacingWpm ? String(pacingWpm) : '60');
    setIsPacingFormOpen(true);
  };

  const handlePacingCaretSubmit = () => {
    const nextPacingWpm = Number(pacingWpmInput);
    if (Number.isFinite(nextPacingWpm) && nextPacingWpm > 0) {
      setPacingWpm(nextPacingWpm);
      saveStoredPacingWpm(nextPacingWpm);
      setIsPacingFormOpen(false);
      setIsExtrasOpen(false);
    }
  };

  useEffect(() => {
    const handleStartShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isControlFocused =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLButtonElement;

      if (event.key === 'Escape' && isInputReady && !finished) {
        event.preventDefault();
        inputRef.current?.blur();
        resetAttempt();
        setIsInputReady(false);
        return;
      }

      if (event.key === 'Enter' && event.shiftKey && !finished && !isControlFocused) {
        event.preventDefault();
        setIsInputReady(true);
        requestAnimationFrame(focusInput);
      }
    };

    window.addEventListener('keydown', handleStartShortcut);
    return () => window.removeEventListener('keydown', handleStartShortcut);
  }, [finished, focusInput, isInputReady, resetAttempt]);

  const progress = testMode === 'typing-test' ? 0 : (typed.length / passage.text.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {testMode === 'passages' ? (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{passage.title}</h2>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Typing Test</h2>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExtrasOpen((current) => !current)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
            >
              Extras
            </button>
            {isExtrasOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/60 dark:border-gray-700 dark:bg-gray-900 dark:shadow-none">
                {!isPacingFormOpen ? (
                  <button
                    type="button"
                    onClick={openPacingCaretForm}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">Pacing Caret</span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500">
                        {pacingWpm ? `${pacingWpm} WPM saved` : 'Set a target pace'}
                      </span>
                    </span>
                    <span className="h-6 w-0.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]" />
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">Pacing Caret</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">Choose the target speed for the guide caret.</div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="pacing-wpm">
                          Words per minute
                        </label>
                        <input
                          id="pacing-wpm"
                          type="number"
                          min="1"
                          value={pacingWpmInput}
                          onChange={(event) => setPacingWpmInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') handlePacingCaretSubmit();
                          }}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handlePacingCaretSubmit}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            value={testMode}
            onChange={(e) => handleModeChange(e.target.value as 'typing-test' | 'passages')}
          >
            <option value="typing-test">Typing Test</option>
            <option value="passages">Type Passages</option>
          </select>
          <button
            onClick={() => handleModeChange(testMode === 'typing-test' ? 'passages' : 'typing-test')}
            title="Shuffle mode"
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={() => restart()}
            title="Restart"
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {!finished ? (
        <>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <span className="text-blue-500 font-bold text-base">{wpm}</span>
              <span>wpm</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <span className="font-bold text-base text-gray-900 dark:text-gray-50">{accuracy}%</span>
              <span>accuracy</span>
            </div>
            {started && (
              <div className="flex items-center gap-1.5 text-gray-600 ml-auto dark:text-gray-300">
                <span className="font-bold text-base text-gray-900 dark:text-gray-50">{formatTime(elapsedSeconds)}</span>
              </div>
            )}
            {!started && (
              <span className="ml-auto text-gray-400 text-xs dark:text-gray-500">Start typing to begin the test</span>
            )}
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            ref={containerRef}
            onClick={isInputReady ? focusInput : undefined}
            className="relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm cursor-text min-h-[180px] transition-colors dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
          >
            <div className={isInputReady ? '' : 'blur-[1px]'}>
              <TextDisplay
                text={passage.text}
                charStates={charStates}
                finished={finished}
                typed={typed}
                pacingWpm={pacingWpm}
                pacingStartTime={startTime}
                showPacingCaret={isInputReady && started && pacingWpm !== null}
              />
            </div>

            {!isInputReady && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 px-6 text-center text-sm font-medium text-gray-500 backdrop-blur-[1px] dark:bg-gray-900/70 dark:text-gray-300">
                press shift + enter to start typing
              </div>
            )}

            <textarea
              ref={inputRef}
              value={typed}
              onChange={(e) => handleInput(e.target.value)}
              className="absolute inset-0 opacity-0 resize-none cursor-text w-full h-full"
              disabled={!isInputReady}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              aria-label="Typing input"
            />
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Press shift + enter and start typing
          </p>
        </>
      ) : (
        <Results
          wpm={wpm}
          accuracy={accuracy}
          errors={errors}
          elapsedSeconds={elapsedSeconds}
          onRestart={() => restart()}
        />
      )}
    </div>
  );
}
