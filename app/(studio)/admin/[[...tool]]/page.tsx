import { StudioLoader } from "@/components/studio/studio-loader";
import { isSanityConfigured } from "@/lib/sanity/client";

export default function AdminPage() {
  if (!isSanityConfigured()) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-4xl">Sanity Studio</h1>
        <p className="mt-4 text-mauve">
          Ustaw <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> i <code>NEXT_PUBLIC_SANITY_DATASET</code>, a panel
          właścicielki otworzy się pod tym adresem.
        </p>
      </main>
    );
  }

  return <StudioLoader />;
}
