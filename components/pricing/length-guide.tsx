import type { HairLength } from "@/lib/booking/types";
import type { LengthGuide } from "@/lib/content/length-guide";

export function LengthGuideCard({ guide, selected }: { guide: LengthGuide; selected?: HairLength | null }) {
  return (
    <aside className="rounded-[1.75rem] bg-white p-5 ring-1 ring-pink-100 sm:p-6">
      <h3 className="font-display text-2xl text-ink">Jak wybrać długość</h3>
      <p className="mt-2 text-sm leading-6 text-ink">{guide.note}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {guide.items.map((item) => {
          const active = selected === item.id;
          return (
            <li key={item.id} className={`rounded-2xl p-4 ${active ? "bg-blush ring-1 ring-berry" : "bg-blush"}`}>
              <p className="text-sm font-semibold text-berry">{item.mark}</p>
              <p className="mt-1 font-display text-xl text-ink">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-ink">{item.hint}</p>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
