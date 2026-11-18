export function PosterBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -right-24 -top-16 h-80 w-80 rounded-full border-[18px] border-paper/10" />
      <div className="absolute -right-10 top-8 h-52 w-52 rounded-full border-[28px] border-acid/80" />
      <div className="absolute right-16 top-24 h-24 w-24 rounded-full bg-night" />
      <svg
        className="absolute left-[-10%] top-[6%] h-40 w-[62%] text-acid"
        viewBox="0 0 400 120"
        fill="none"
      >
        <path
          d="M8 72 C 60 8, 110 110, 170 48 S 280 10, 392 64"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
    </div>
  );
}
