import React from 'react';

export default function ResultCard({ result }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors">
      {/* Rank */}
      <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        result.rank === 1
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : result.rank === 2
          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          : result.rank === 3
          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
          : 'bg-muted text-muted-foreground'
      }`}>
        {result.rank}
      </div>

      {/* Avatar */}
      <div className="flex-none h-10 w-10 rounded-full overflow-hidden bg-muted border border-border">
        {result.photo ? (
          <img src={result.photo} alt={result.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm font-bold text-muted-foreground">
            {result.name?.[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{result.name}</p>
        <p className="text-xs text-muted-foreground truncate">{result.party}</p>
        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${result.percent}%` }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="flex-none text-right">
        <p className="text-sm font-bold">{result.votes.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{result.percent}%</p>
      </div>
    </div>
  );
}
