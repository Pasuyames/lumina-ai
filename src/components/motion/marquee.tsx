import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: React.ReactNode;
  reverse?: boolean;
  durationSeconds?: number;
  className?: string;
  /** Öğeler arası boşluk — küçük rozet şeritlerinde daraltmak için. */
  gapClassName?: string;
};

/**
 * Saf CSS ile sonsuz döngülü yatay kayan şerit. İçerik iki kez art arda
 * render edilir (ikincisi ekran okuyucudan gizli) ve %50 kaydırılarak
 * kesintisiz bir döngü oluşturulur — framer/motion gerekmez.
 */
export function Marquee({
  children,
  reverse = false,
  durationSeconds = 30,
  className,
  gapClassName = "gap-x-6",
}: MarqueeProps) {
  // Kenarlarda yumuşak soluklaşma — sert dikdörtgen kırpma rozetleri
  // düz bir çizgiyle keserek kutu-içinde-kutu izlenimi veriyordu.
  const edgeFade = {
    WebkitMaskImage:
      "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
    maskImage:
      "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
  } as React.CSSProperties;

  return (
    <div className={cn("overflow-hidden", className)} style={edgeFade}>
      <div
        className={cn(
          "flex w-max rz-marquee-track",
          gapClassName,
          reverse && "rz-marquee-reverse",
        )}
        style={
          {
            "--rz-marquee-duration": `${durationSeconds}s`,
          } as React.CSSProperties
        }
      >
        <div className={cn("flex shrink-0 items-center", gapClassName)}>
          {children}
        </div>
        <div className={cn("flex shrink-0 items-center", gapClassName)} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
