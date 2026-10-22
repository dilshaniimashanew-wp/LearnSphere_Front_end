"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form";
import { Stars } from "@/components/ui/stars";
import { errorMessage, send, useApi } from "@/lib/use-api";
import { cn, formatDate } from "@/lib/utils";

interface Reviews {
  average: number;
  count: number;
  canReview: boolean;
  mine: { rating: number; comment?: string } | null;
  items: { id: string; name: string; rating: number; comment?: string; updatedAt: string }[];
}

export function ReviewsSection({ courseId, onChanged }: { courseId: string; onChanged?: () => void }) {
  const { data, error, reload } = useApi<Reviews>(`/courses/${courseId}/reviews`);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const currentRating = rating ?? data?.mine?.rating ?? 0;
  const currentComment = comment ?? data?.mine?.comment ?? "";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!currentRating) return setMessage({ tone: "danger", text: "Choose a star rating first." });
    setBusy(true);
    setMessage(null);
    try {
      await send("PUT", `/courses/${courseId}/reviews`, { rating: currentRating, comment: currentComment.trim() || undefined });
      setMessage({ tone: "success", text: "Thanks! Your review was saved." });
      reload();
      onChanged?.();
    } catch (err) {
      setMessage({ tone: "danger", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    await send("DELETE", `/courses/${courseId}/reviews/mine`).catch(() => undefined);
    setRating(null);
    setComment(null);
    reload();
    onChanged?.();
  }

  if (error) return null;
  return (
    <section aria-labelledby="reviews" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="reviews" className="text-xl font-semibold">
          Ratings and reviews
        </h2>
        {data && <Stars value={data.average} count={data.count} className="text-sm" />}
      </div>

      {data?.canReview && (
        <Card>
          <form onSubmit={save} className="space-y-3">
            <fieldset>
              <legend className="mb-1 text-sm font-medium">{data.mine ? "Your review" : "Rate this course"}</legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className="cursor-pointer">
                    <input type="radio" name="rating" value={n} className="peer sr-only" checked={currentRating === n} onChange={() => setRating(n)} />
                    <Star className={cn("h-7 w-7 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary", currentRating >= n ? "fill-warning text-warning" : "text-border")} aria-hidden />
                    <span className="sr-only">
                      {n} star{n === 1 ? "" : "s"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Comment (optional)" htmlFor="review-comment">
              <Textarea id="review-comment" rows={3} maxLength={2000} value={currentComment} onChange={(e) => setComment(e.target.value)} />
            </Field>
            {message && <Alert tone={message.tone}>{message.text}</Alert>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy}>
                {data.mine ? "Update review" : "Submit review"}
              </Button>
              {data.mine && (
                <Button type="button" size="sm" variant="ghost" onClick={() => void remove()}>
                  Remove
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {data?.items.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Enrolled students can be the first.</p>}
      <ul className="space-y-3">
        {data?.items.map((r) => (
          <li key={r.id}>
            <Card className="space-y-1 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground">{formatDate(r.updatedAt)}</span>
              </div>
              <Stars value={r.rating} />
              {r.comment && <p className="text-sm">{r.comment}</p>}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
