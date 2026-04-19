import { RotateCcw, Zap, Target, Clock, AlertCircle } from 'lucide-react';

interface ResultsProps {
  wpm: number;
  accuracy: number;
  errors: number;
  elapsedSeconds: number;
  onRestart: () => void;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl p-6 ${
        highlight
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
          : 'bg-white border border-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none'
      }`}
    >
      <div className={`mb-2 ${highlight ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>{icon}</div>
      <div className={`text-4xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-gray-900 dark:text-gray-50'}`}>
        {value}
      </div>
      {sub && (
        <div className={`text-xs font-medium mt-0.5 ${highlight ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
          {sub}
        </div>
      )}
      <div className={`text-sm font-medium mt-1 ${highlight ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </div>
    </div>
  );
}

function wpmLabel(wpm: number): string {
  if (wpm >= 100) return 'Blazing fast!';
  if (wpm >= 70) return 'Excellent!';
  if (wpm >= 50) return 'Great job!';
  if (wpm >= 30) return 'Keep it up!';
  return 'Keep practicing!';
}

export default function Results({ wpm, accuracy, errors, elapsedSeconds, onRestart }: ResultsProps) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">Test Complete</h2>
        <p className="text-gray-500 mt-1 dark:text-gray-400">{wpmLabel(wpm)}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        <StatCard
          icon={<Zap size={20} />}
          label="Words / min"
          value={String(wpm)}
          highlight
        />
        <StatCard
          icon={<Target size={20} />}
          label="Accuracy"
          value={`${accuracy}%`}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Time"
          value={timeStr}
        />
        <StatCard
          icon={<AlertCircle size={20} />}
          label="Errors"
          value={String(errors)}
        />
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-300 dark:focus:ring-offset-gray-950"
      >
        <RotateCcw size={16} />
        Try Again
      </button>
    </div>
  );
}
