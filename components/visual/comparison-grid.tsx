import { BeforeAfterSlider } from "@/components/visual/before-after-slider";
import type { ComparisonPair } from "@/lib/cms/showcase-types";

export function ComparisonGrid({ items }: { items: ComparisonPair[] }) {
  if (items.length === 0) {
    return <p className="text-base text-ink">Pary przed i po dodasz w panelu, w zakładce Pokaz.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <BeforeAfterSlider
          key={item.id}
          before={item.before}
          after={item.after}
          split={item.before === item.after}
          beforeSide={item.beforeSide}
          title={item.title}
        />
      ))}
    </div>
  );
}
