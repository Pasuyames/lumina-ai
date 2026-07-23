import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center", className)}
    >
      <Image
        src="/renza-logo.png"
        alt={APP_NAME}
        width={318}
        height={109}
        priority
        className="h-6 w-auto sm:h-7"
      />
    </Link>
  );
}
