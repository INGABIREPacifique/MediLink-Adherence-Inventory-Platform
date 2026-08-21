interface GreetingBannerProps {
  roleLabel: string;      // e.g. "COMPLIANCE OFFICER · 7 Active Cases"
  name: string;            // e.g. "Jonathan"
  subtext: string;         // e.g. "2 high-risk flags need your attention today."
}

// Matches the dark navy gradient + pill badge + bold greeting pattern from
// the reference design. Sits at the top of a page's content, above the
// light-background cards/tables — same dark-surface tokens as the sidebar.
export function GreetingBanner({ roleLabel, name, subtext }: GreetingBannerProps) {
  function timeOfDayGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-navy-800 to-navy-700 px-8 py-6 shadow-md">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-white/5" />
      <div className="relative flex flex-col gap-3">
        <span className="w-fit rounded-full border border-on-dark-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-dark-muted">
          {roleLabel}
        </span>
        <h1 className="text-2xl font-bold text-on-dark">
          {timeOfDayGreeting()}, {name}!
        </h1>
        <p className="text-sm text-on-dark-muted">{subtext}</p>
      </div>
    </div>
  );
}
