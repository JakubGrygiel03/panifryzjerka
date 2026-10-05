export function NoticeBar({ enabled, text }: { enabled: boolean; text: string }) {
  if (!enabled || !text.trim()) return null;
  return (
    <div className="bg-berry px-4 py-2 text-center text-sm font-medium text-white">{text}</div>
  );
}
