"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import {
  signInAction,
  signUpAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { ROUTES } from "@/lib/constants";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const action = isLogin ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? ROUTES.dashboard;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {isLogin ? "Tekrar hoş geldiniz" : "Hesap oluşturun"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Stüdyonuza erişmek için giriş yapın."
            : "Kaydolun ve 3 ücretsiz görsel hakkınızı kazanın."}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input
                id="full_name"
                name="full_name"
                autoComplete="name"
                placeholder="Adınız"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ornek@marka.com"
              defaultValue={searchParams.get("email") ?? undefined}
              aria-describedby={state?.error ? "auth-form-error" : undefined}
              aria-invalid={state?.error ? true : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Parola</Label>
              {isLogin && (
                <Link
                  href={ROUTES.forgotPassword}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Şifremi unuttum
                </Link>
              )}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••"
              aria-describedby={state?.error ? "auth-form-error" : undefined}
              aria-invalid={state?.error ? true : undefined}
            />
          </div>
          <input type="hidden" name="next" value={next} />
          {state?.error && (
            <p
              id="auth-form-error"
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-2 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Spinner />}
            {isLogin ? "Giriş yap" : "Ücretsiz başla"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Hesabınız yok mu?{" "}
                <Link
                  href={ROUTES.register}
                  className="font-medium text-primary hover:underline"
                >
                  Kaydolun
                </Link>
              </>
            ) : (
              <>
                Zaten üye misiniz?{" "}
                <Link
                  href={ROUTES.login}
                  className="font-medium text-primary hover:underline"
                >
                  Giriş yapın
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
