"use client";

import { Scissors } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">
        Coś się zacięło.
        <Scissors className="ml-2 inline-block text-berry" size={32} aria-hidden />
      </h1>
      <button type="button" onClick={reset} className="mt-8 rounded-full bg-berry px-6 py-3 text-sm font-semibold text-white hover:bg-berry-deep">
        Spróbuj ponownie
      </button>
    </main>
  );
}
