import { Search, Bell, HelpCircle } from 'lucide-react';

export function TopNav() {
  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-10 shadow-sm">
      <div className="flex flex-1 items-center gap-6">
        <h2 className="whitespace-nowrap text-[28px] font-bold leading-[1.1] tracking-[-0.5px] text-navy">
          HealthAdmin
          <br />
          Rwanda
        </h2>
        <div className="relative w-full max-w-md">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
          <input
            type="text"
            placeholder="Search patients, ID, or medications..."
            className="w-full rounded-xl border border-border bg-bg py-2.5 pl-10 pr-4 text-sm text-body outline-none focus:ring-2 focus:ring-navy-light/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative flex items-center justify-center rounded-xl p-2 hover:bg-black/5"
        >
          <Bell size={20} className="text-body" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full border border-white bg-danger" />
        </button>
        <button aria-label="Help" className="flex items-center justify-center rounded-xl p-2 hover:bg-black/5">
          <HelpCircle size={20} className="text-body" />
        </button>
        <div className="ml-4 size-8 overflow-hidden rounded-xl border border-border bg-[#e7e8ef]" />
      </div>
    </header>
  );
}
