import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/feedback";

const certificates = [{ id: "cert1", course: "Data Analysis with Python", code: "LS-8F3K-29QX", issued: "2026-10-05" }];

export default function CertificatesPage() {
  return (
    <>
      <PageHeader title="Certificates" description="Earned when you complete a course." />
      {certificates.length === 0 ? (
        <EmptyState title="No certificates yet" description="Complete a course to earn one." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((c) => (
            <Card key={c.id} className="space-y-2">
              <Award className="h-8 w-8 text-primary" aria-hidden />
              <h2 className="font-semibold">{c.course}</h2>
              <p className="text-sm text-muted-foreground">Issued {c.issued}</p>
              <p className="text-sm">
                Code: <span className="font-mono">{c.code}</span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
