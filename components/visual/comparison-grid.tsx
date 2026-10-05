import { BeforeAfterSlider } from "@/components/visual/before-after-slider";

const comparisons = [
  {
    before: "/salon/biz-05.jpg",
    after: "/salon/biz-05.jpg",
    split: true,
    beforeSide: "right" as const,
    title: "Szycie siwizny",
    tag: "Przed i po",
  },
  {
    before: "/salon/inspiration-07.jpg",
    after: "/salon/inspiration-07.jpg",
    split: true,
    beforeSide: "left" as const,
    title: "Koloryzacja",
    tag: "Róż pod spodem",
  },
  {
    before: "/salon/perm-before.jpg",
    after: "/salon/perm-after.jpg",
    split: false,
    beforeSide: "right" as const,
    title: "Trwała ondulacja",
    tag: "Wałki i efekt",
  },
];

export function ComparisonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {comparisons.map((item) => (
        <BeforeAfterSlider key={item.title} {...item} />
      ))}
    </div>
  );
}
