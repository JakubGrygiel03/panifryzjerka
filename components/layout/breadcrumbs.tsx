import Link from "next/link";

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Okruszki" className="mb-4 text-sm text-mauve">
      <ol className="flex flex-wrap gap-2">
        <li>
          <Link href="/" className="hover:text-berry">
            Start
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href}>
            /{" "}
            <Link href={item.href} className="hover:text-berry">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
