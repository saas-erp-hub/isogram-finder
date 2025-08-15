import { FC } from 'react';
import type { Solution } from '../search.worker';

const SolutionCard: FC<{ solution: Solution; rank: number }> = ({ solution, rank }) => (
  <div className="w-full bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl border border-indigo-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start">
      <p className="text-lg font-semibold text-indigo-900 break-words">
        <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-3 select-none">#{rank}</span>
        {solution.words.map(w => w.word).join('')}
      </p>
      <div className="flex flex-col items-end ml-4 flex-shrink-0">
        <span className="font-bold text-indigo-700 text-lg tabular-nums">{solution.len}</span>
        <span className="text-xs text-indigo-500">Length</span>
      </div>
    </div>
    <div className="flex justify-between items-end mt-3 pt-3 border-t border-indigo-100">
        <div className="text-sm text-indigo-700 font-medium truncate">
            {solution.words.map(w => w.word).join(' + ')}
        </div>
        <div className="flex flex-col items-end">
            <span className="font-bold text-amber-600 text-md tabular-nums">{solution.score.toFixed(2)}</span>
            <span className="text-xs text-indigo-500">Score</span>
        </div>
    </div>
  </div>
);

export default SolutionCard;
