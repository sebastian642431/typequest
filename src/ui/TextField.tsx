type Props = {
  value: string;
  onChange: (v: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
};

export function TextField({ value, onChange, label, disabled = false, className = "" }: Props) {
  return (
    <input
      autoFocus
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      aria-label={label}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      className={`h-12 w-full min-w-0 rounded-xl border-2 border-line bg-surface px-4 font-mono text-[15px] text-ink outline-none focus:border-accent ${className}`}
    />
  );
}
