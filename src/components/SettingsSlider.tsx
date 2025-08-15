import { FC } from 'react';

const SettingsSlider: FC<{ label: string; value: number; min: number; max: number; step?: number; onChange: (val: number) => void; unit?: string; help?: string; }> =
({ label, value, min, max, step = 1, onChange, unit = '', help }) => (
  <div className="space-y-2">
    <label className="flex justify-between items-center text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="text-indigo-700 font-semibold">{value}{unit}</span>
    </label>
    {help && <p className="text-xs text-slate-500 -mt-1">{help}</p>}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  </div>
);

export default SettingsSlider;
