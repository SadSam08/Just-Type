import { useEffect, useRef, useState } from 'react';
import { CharState } from '../hooks/useTypingTest';

interface TextDisplayProps {
  text: string;
  charStates: CharState[];
  finished: boolean;
  typed: string;
  pacingWpm: number | null;
  pacingStartTime: number | null;
  showPacingCaret: boolean;
}

const charClass: Record<CharState, string> = {
  pending: 'text-gray-400 dark:text-gray-500',
  correct: 'text-gray-900 dark:text-gray-100',
  incorrect: 'bg-red-100 text-red-600 rounded-sm dark:bg-red-950 dark:text-red-300',
  current: 'text-gray-900 dark:text-gray-100',
};

export default function TextDisplay({
  text,
  charStates,
  finished,
  typed,
  pacingWpm,
  pacingStartTime,
  showPacingCaret,
}: TextDisplayProps) {
  const currentCharIndex = typed.length;
  const displayRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [caretPosition, setCaretPosition] = useState({
    left: 0,
    top: 0,
    height: 0,
    visible: false,
  });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const activeChar = charRefs.current[currentCharIndex] || charRefs.current[currentCharIndex - 1];
    const firstChar = charRefs.current[0];
    if (activeChar && firstChar) {
      const offsetTop = activeChar.offsetTop - firstChar.offsetTop;
      const charHeight = activeChar.offsetHeight;
      if (charHeight > 0) {
        const currentLine = Math.round(offsetTop / charHeight);
        if (currentLine >= 1) {
          setScrollY((currentLine - 1) * charHeight);
        } else {
          setScrollY(0);
        }
      }
    }
  }, [currentCharIndex]);

  useEffect(() => {
    if (!showPacingCaret || !pacingWpm || !pacingStartTime || finished) {
      setCaretPosition((current) => ({ ...current, visible: false }));
      return;
    }

    let frameId = 0;

    const updateCaret = () => {
      const displayElement = displayRef.current;
      if (!displayElement || text.length === 0) {
        frameId = requestAnimationFrame(updateCaret);
        return;
      }

      const elapsedMinutes = Math.max(0, Date.now() - pacingStartTime) / 60000;
      const charProgress = Math.min(text.length - 1, elapsedMinutes * pacingWpm * 5);
      const currentIndex = Math.floor(charProgress);
      const nextIndex = Math.min(text.length - 1, currentIndex + 1);
      const progressBetweenChars = charProgress - currentIndex;
      const currentChar = charRefs.current[currentIndex];
      const nextChar = charRefs.current[nextIndex] ?? currentChar;

      if (!currentChar || !nextChar) {
        frameId = requestAnimationFrame(updateCaret);
        return;
      }

      const displayRect = displayElement.getBoundingClientRect();
      const currentRect = currentChar.getBoundingClientRect();
      const nextRect = nextChar.getBoundingClientRect();

      setCaretPosition({
        left: currentRect.left + (nextRect.left - currentRect.left) * progressBetweenChars - displayRect.left,
        top: currentRect.top + (nextRect.top - currentRect.top) * progressBetweenChars - displayRect.top,
        height: currentRect.height,
        visible: true,
      });

      frameId = requestAnimationFrame(updateCaret);
    };

    frameId = requestAnimationFrame(updateCaret);
    return () => cancelAnimationFrame(frameId);
  }, [finished, pacingStartTime, pacingWpm, showPacingCaret, text]);

  return (
    <div
      className="relative overflow-hidden w-full text-xl sm:text-2xl"
      style={{ height: 'calc(4 * 1.625em)' }}
    >
      <div
        ref={displayRef}
        className="relative font-mono leading-relaxed tracking-wide whitespace-pre-wrap break-words select-none transition-transform duration-200 ease-out"
        style={{ transform: `translateY(-${scrollY}px)` }}
      >
        {caretPosition.visible && (
        <span
          className="absolute z-10 w-0.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]"
          style={{
            height: `${caretPosition.height}px`,
            transform: `translate(${caretPosition.left}px, ${caretPosition.top}px)`,
          }}
        />
      )}
      {text.split('').map((char, i) => {
        const state = charStates[i] ?? 'pending';
        const isNextChar = i === currentCharIndex && !finished;
        const bgClass = isNextChar ? 'bg-blue-100 rounded px-0.5 dark:bg-blue-500/25' : '';
        const displayChar = char === ' ' ? '\u00a0' : char;

        return (
          <span
            key={i}
            ref={(element) => {
              charRefs.current[i] = element;
            }}
            className={`transition-colors duration-150 ease-out ${charClass[state]} ${bgClass}`}
          >
            {displayChar}
          </span>
        );
      })}
      </div>
    </div>
  );
}
