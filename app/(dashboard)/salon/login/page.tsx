"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError("Supabase nie jest skonfigurowane. Lokalnie panel dnia działa bez logowania.");
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/salon/kalendarz");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form onSubmit={submit} className="w-full space-y-3 rounded-3xl bg-white p-6">
        <h1 className="font-display text-3xl">Wejście dla salonu</h1>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" className="w-full rounded-2xl border border-pink-100 px-3 py-2" />
        <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Hasło" className="w-full rounded-2xl border border-pink-100 px-3 py-2" />
        {error ? <p className="text-sm text-berry">{error}</p> : null}
        <button type="submit" className="w-full rounded-full bg-berry py-3 font-semibold text-white">
          Zaloguj
        </button>
      </form>
    </main>
  );
}
