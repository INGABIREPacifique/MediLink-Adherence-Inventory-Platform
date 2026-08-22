interface GreetingBannerProps {
  roleLabel: string;
  name: string;
  subtext: string;
}

// Matches the reference: dark navy gradient surface, pill-shaped role badge,
// bold time-aware greeting, subtext. Uses the app's own navy palette
// (--color-navy / navy-light from index.css) rather than the reference's
// blue/green so it's consistent with the rest of MediLink, not a copy-paste
// of a different product's colors.
export function GreetingBanner({ roleLabel, name, subtext }: GreetingBannerProps) {
  function timeOfDayGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy to-navy-light px-8 py-6 shadow-md">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-white/5" />
      <div className="relative flex flex-col gap-3">
        <span className="w-fit rounded-full border border-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
          {roleLabel}
        </span>
        <h1 className="text-2xl font-bold text-white">
          {timeOfDayGreeting()}, {name}!
        </h1>
        <p className="text-sm text-white/80">{subtext}</p>
      </div>
    </div>
  );
}
