import { cn } from './utils';

interface PeriodSelectorProps {
  currentPeriod: string;
  onChange: (p: string) => void;
}

/** Small D/S/M period toggle buttons used inside StatCards. */
export function PeriodSelector({ currentPeriod, onChange }: PeriodSelectorProps) {
  return (
    <>
      {(['hoje', 'semana_atual', 'mes_atual'] as const).map((p, i) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-2 py-0.5 text-[10px] font-bold rounded',
            currentPeriod === p
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
          )}
        >
          {['D', 'S', 'M'][i]}
        </button>
      ))}
    </>
  );
}
