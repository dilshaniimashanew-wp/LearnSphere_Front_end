"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { api } from "@/lib/api";

interface Verified {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
}

export default function VerifyCertificatePage() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Verified | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      setResult(await api<Verified>(`/certificates/verify/${encodeURIComponent(code.trim())}`));
    } catch {
      setError("No valid certificate found for that code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Verify a certificate</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter the verification code printed on the certificate.</p>
      <form onSubmit={verify} className="mt-6 space-y-4">
        <Field label="Certificate code" htmlFor="code">
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="e.g. LS-8F3K-29QX" />
        </Field>
        <Button type="submit" disabled={busy || !code.trim()} className="w-full">
          {busy ? "Checking..." : "Verify"}
        </Button>
      </form>
      <div className="mt-6" aria-live="polite">
        {error && <Alert tone="danger">{error}</Alert>}
        {result && (
          <Card className="space-y-1">
            <p className="flex items-center gap-2 font-medium text-success">
              <BadgeCheck className="h-5 w-5" aria-hidden /> Valid certificate
            </p>
            <p className="text-sm">{result.studentName}</p>
            <p className="text-sm text-muted-foreground">{result.courseTitle}</p>
            <p className="text-xs text-muted-foreground">Issued {new Date(result.issuedAt).toLocaleDateString()}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
