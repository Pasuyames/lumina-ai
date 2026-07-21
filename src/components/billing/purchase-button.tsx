"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

/** Paket satın alma formunun submit butonu — form gönderilirken pending görünür. */
export function PurchaseButton({
  children,
  variant,
  ...props
}: React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants>) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending} {...props}>
      {pending ? <Spinner /> : null}
      {children}
    </Button>
  );
}
