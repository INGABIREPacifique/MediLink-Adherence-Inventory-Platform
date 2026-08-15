export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-white py-24 text-center">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="text-sm text-body">This screen is scheduled for a later phase of the pilot build.</p>
    </div>
  );
}
