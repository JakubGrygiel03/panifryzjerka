"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center px-4">
      <h1 className="font-display text-4xl">Coś się zacięło</h1>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-berry px-4 py-2 text-sm font-semibold text-white">
        Spróbuj ponownie
      </button>
    </main>
  );
}
