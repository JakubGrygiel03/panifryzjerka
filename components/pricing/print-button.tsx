"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="no-print rounded-full bg-white px-4 py-2 text-sm ring-1 ring-pink-100">
      Drukuj cennik
    </button>
  );
}
