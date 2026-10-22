"use client";

import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";
import { Query } from "@/components/ui/query";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";

interface Certificate {
  id: string;
  course: string;
  code: string;
  issuedAt: string;
}

export default function CertificatesPage() {
  const { data, error, loading } = useApi<Certificate[]>("/certificates/me");
  return (
    <>
      <PageHeader title="Certificates" description="Earned when you complete a course. Share the code so anyone can verify it." />
      <Query loading={loading} error={error}>
        {data?.length === 0 ? (
          <EmptyState title="No certificates yet" description="Finish all required lessons and pass every quiz to earn one." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.map((c) => (
              <Card key={c.id} className="space-y-2">
                <Award className="h-8 w-8 text-primary" aria-hidden />
                <h2 className="font-semibold">{c.course}</h2>
                <p className="text-sm text-muted-foreground">Issued {formatDate(c.issuedAt)}</p>
                <p className="text-sm">
                  Code: <span className="font-mono">{c.code}</span>
                </p>
              </Card>
            ))}
          </div>
        )}
      </Query>
    </>
  );
}
