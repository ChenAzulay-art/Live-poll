export function DisplayTitle({
  text,
  as: Tag = "h1",
  className = "",
}: {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
}) {
  const parts = text.trim().split(" ");
  const last = parts.pop() ?? "";
  const lead = parts.join(" ");

  return (
    <Tag
      className={`font-display leading-[0.9] tracking-tight text-paper ${className || "text-5xl sm:text-6xl"}`}
    >
      {lead ? `${lead} ` : null}
      <span className="text-acid">{last}</span>
    </Tag>
  );
}
