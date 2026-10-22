"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/feedback";
import { useAuth } from "@/features/auth/auth-context";
import { errorMessage, send } from "@/lib/use-api";
import type { User } from "@/types";

const SIZE = 128;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Center-crops the picked image to a small square JPEG so only a few KB are stored with the profile. */
async function toAvatarDataUrl(file: File) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function AvatarUploader() {
  const { user, setUser } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  async function save(avatarUrl: string | null, success: string) {
    setBusy(true);
    setMessage(null);
    try {
      setUser(await send<User>("PATCH", "/users/me", { avatarUrl }));
      setMessage({ tone: "success", text: success });
    } catch (e) {
      setMessage({ tone: "danger", text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setMessage({ tone: "danger", text: "Choose a JPEG, PNG or WebP image." });
    if (file.size > MAX_FILE_BYTES) return setMessage({ tone: "danger", text: "Image must be 5 MB or smaller." });
    try {
      await save(await toAvatarDataUrl(file), "Profile picture updated.");
    } catch {
      setMessage({ tone: "danger", text: "Could not read that image." });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Avatar name={user?.name ?? ""} url={user?.avatarUrl} className="h-20 w-20 text-xl" />
        <div className="space-y-2">
          <input
            ref={input}
            id="avatar-file"
            aria-label="Choose a profile picture"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => void onPick(e)}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
              {user?.avatarUrl ? "Change picture" : "Upload picture"}
            </Button>
            {user?.avatarUrl && (
              <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void save(null, "Profile picture removed.")}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPEG, PNG or WebP up to 5 MB. It is cropped to a square.</p>
        </div>
      </div>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
    </div>
  );
}
