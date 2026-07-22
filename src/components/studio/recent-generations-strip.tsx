import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";

/**
 * Stüdyo başlangıç ekranının altında, kullanıcının en son ürettiği
 * görsellerin küçük bir şeridi — hızlıca göz atıp /generations'a geçebilsin.
 * Hiç üretim yoksa hiçbir şey render etmez (boş durum burada gösterilmez,
 * dashboard zaten karşılıyor).
 */
export function RecentGenerationsStrip({
  items,
}: {
  items: { id: string; title: string | null; imageUrl: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10 border-t border-border pt-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Son Üretilenler
        </p>
        <Link
          href={ROUTES.generations}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Tümünü Gör
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${ROUTES.generations}/${item.id}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card"
          >
            <Image
              src={item.imageUrl}
              alt={item.title ?? "Üretim"}
              fill
              sizes="(min-width: 640px) 16vw, 30vw"
              className="object-cover transition group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
