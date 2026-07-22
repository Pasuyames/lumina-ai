"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfileAction, type SettingsState } from "@/app/(app)/settings/actions";

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Profil</CardTitle>
        <CardDescription>Adınız navbar ve faturalarda görünür.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input
              key={fullName}
              id="full_name"
              name="full_name"
              autoComplete="name"
              defaultValue={fullName}
              placeholder="Adınız"
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
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner />}
            Kaydet
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
