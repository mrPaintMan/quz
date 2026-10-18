"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  // Resolves to whether the passphrase was accepted.
  onSubmit: (passphrase: string) => Promise<boolean>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const accepted = await onSubmit(passphrase.trim()).catch(() => false);
    setPending(false);
    if (!accepted) {
      setError("Fel lösenord. Försök igen.");
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-semibold">Quz för domare</h1>
        <div className="flex flex-col gap-2">
          <Label htmlFor="passphrase">Lösenord</Label>
          <Input
            id="passphrase"
            type="password"
            autoComplete="current-password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error ? "passphrase-error" : undefined}
            required
          />
          {error && (
            <p id="passphrase-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" disabled={pending || passphrase.trim() === ""}>
          {pending ? "Kontrollerar…" : "Logga in"}
        </Button>
      </form>
    </main>
  );
}
