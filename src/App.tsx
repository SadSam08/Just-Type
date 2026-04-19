import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import TypingTest from './components/TypingTest';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
        <header className="border-b border-gray-100 bg-white sticky top-0 z-10 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={isDarkMode ? "/assets/justtype-logo-light.svg" : "/assets/justtype-logo.svg"} alt="JustType" className="h-24 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDarkMode((current) => !current)}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-10 sm:py-16">
          <TypingTest />
        </main>

        <footer className="border-t border-gray-100 bg-white py-4 text-center text-xs text-gray-400 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500">
          JustType &mdash; Test your typing speed in words per minute
        </footer>
      </div>
    </div>
  );
}
