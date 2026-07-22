"use client";

import { useActionState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adjustCreditsAction, type AdminState } from "@/app/(app)/admin/actions";

export function CreditAdjustDialog({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    adjustCreditsAction,
    null,
  );

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Coins className="size-3.5" /> Kredi düzelt
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kredi düzelt</DialogTitle>
          <DialogDescription>{email}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="user_id" value={userId} />
          <div className="space-y-1.5">
            <Label htmlFor={`amount-${userId}`}>Miktar</Label>
            <Input
              id={`amount-${userId}`}
              name="amount"
              type="number"
              min={1}
              step={1}
              required
              placeholder="10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`reason-${userId}`}>Gerekçe</Label>
            <Input
              id={`reason-${userId}`}
              name="reason"
              required
              placeholder="örn. destek talebi #123"
            />
          </div>
          {state && "error" in state && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state && "success" in state && (
            <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
              {state.success}
            </p>
          )}
          <DialogFooter>
            <Button
              type="submit"
              name="direction"
              value="spend"
              variant="destructive"
              disabled={pending}
            >
              {pending && <Spinner />}
              Düş
            </Button>
            <Button type="submit" name="direction" value="grant" disabled={pending}>
              {pending && <Spinner />}
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
