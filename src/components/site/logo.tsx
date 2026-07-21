import Link from "next/link";
import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/15">
        <Gem className="size-4" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        {APP_NAME}
      </span>
    </Link>
  );
}
