export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <p
      className={`font-display text-sm tracking-[0.28em] text-acid ${className}`}
    >
      LIVE POLL
    </p>
  );
}
