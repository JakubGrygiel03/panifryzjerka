import Image from "next/image";
import type { TeamMember } from "@/lib/content/types";
import { irynaPhoto } from "@/lib/content/gallery";

export function Team({ members }: { members: TeamMember[] }) {
  const dog = members.find((member) => member.id === "bella-pies");
  const stylists = members.filter((member) => member.id !== "bella-pies");

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-40px_rgba(31,26,36,0.55)] ring-1 ring-ink/5">
      <div className="grid md:grid-cols-[0.78fr_1.15fr_0.85fr]">
        <div className="relative aspect-[4/5] md:aspect-auto md:h-full md:min-h-80">
          <Image
            src={irynaPhoto.src}
            alt={irynaPhoto.alt}
            fill
            sizes="(min-width: 768px) 28vw, 100vw"
            className="object-cover object-[center_20%]"
          />
        </div>
        <div className="space-y-10 p-8 sm:p-10">
          {stylists.map((member) => (
            <article key={member.id}>
              <p className="eyebrow">Przy fotelu</p>
              <h3 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{member.name}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-ink/75">{member.bio}</p>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {member.specialties.map((item) => (
                  <li key={item} className="border-b border-berry/25 pb-0.5 text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        {dog ? (
          <aside className="flex flex-col justify-between bg-ink px-8 py-10 text-white sm:px-10">
            <p className="text-base font-semibold text-white">Pies salonu</p>
            <div>
              <h3 className="font-display text-4xl">{dog.name}</h3>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">{dog.bio}</p>
            </div>
            <p className="mt-10 text-sm text-pink-100">Spokojne psy są tu mile widziane.</p>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
