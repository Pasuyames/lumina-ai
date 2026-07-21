"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
