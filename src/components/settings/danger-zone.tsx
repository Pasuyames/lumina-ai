"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccountAction, type SettingsState } from "@/app/(app)/settings/actions";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    deleteAccountAction,
    null,
  );

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="font-heading text-lg text-destructive">
          Tehlikeli bölge
        </CardTitle>
        <CardDescription>
          Hesabınızı silmek; profilinizi, kredi geçmişinizi ve tüm
          üretimlerinizi kalıcı olarak siler. Bu işlem geri alınamaz.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="destructive" />}>
            Hesabımı sil
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hesabınızı silmek üzeresiniz</DialogTitle>
              <DialogDescription>
                Bu işlem geri alınamaz. Onaylamak için aşağıya büyük harflerle{" "}
                <strong>SİL</strong> yazın.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="confirm_text">Onay</Label>
                <Input
                  id="confirm_text"
                  name="confirm_text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SİL"
                  autoComplete="off"
                />
              </div>
              {state && "error" in state && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={pending || confirmText !== "SİL"}
                >
                  {pending && <Spinner />}
                  Hesabımı kalıcı olarak sil
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
