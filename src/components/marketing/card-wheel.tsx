import Image from "next/image";

/**
 * Hero'daki 3B kart tekerleği: her grup, alt kenarından pivot eden 8 kollu
 * bir çark; tüm düzenek `rotateX(-77deg)` ile geriye yatırıldığı için
 * daire değil, sığ bir yelpaze gibi okunur. Gruplar aynı hızda ama farklı
 * başlangıç açısıyla sürekli döner (saf CSS animasyonu, JS yok).
 */
const FACE_COUNT = 8;
const CARD_SIZE = 128; // px — tek bir kartın genişliği
const ARM_LENGTH = 640; // px — pivot noktasına olan kol uzunluğu
const SPIN_SECONDS = 40;

export type WheelGroup = {
  /** Çarkın yüzlerinde sırayla tekrar eden görseller. */
  images: string[];
  /** Grubun başlangıç açısı (derece) — gruplar üst üste binmesin diye. */
  baseRotate: number;
};

function Wheel({ images, baseRotate }: WheelGroup) {
  const faces = Array.from(
    { length: FACE_COUNT + 1 },
    (_, i) => images[i % images.length],
  );

  return (
    <div
      className="rz-wheel absolute inset-0"
      style={
        {
          transformStyle: "preserve-3d",
          "--rz-wheel-base": `${baseRotate}deg`,
          "--rz-wheel-duration": `${SPIN_SECONDS}s`,
        } as React.CSSProperties
      }
    >
      {faces.map((src, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-0"
          style={{
            width: CARD_SIZE,
            height: ARM_LENGTH,
            marginLeft: -CARD_SIZE / 2,
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
            transform: `rotate(${-45 * i}deg) translateZ(-1px)`,
          }}
        >
          <Image
            src={src}
            alt=""
            width={560}
            height={560}
            sizes="128px"
            className="relative aspect-square w-full rounded-lg object-cover shadow-xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateX(90deg)" }}
          />
        </div>
      ))}
    </div>
  );
}

export function CardWheel({ groups }: { groups: WheelGroup[] }) {
  return (
    <div
      aria-hidden
      className="relative flex items-center justify-center"
      style={{ perspective: 2000 }}
    >
      <div
        className="absolute w-full"
        style={{
          height: 1280,
          transformStyle: "preserve-3d",
          transform: "translateY(10%) translateZ(-320px) rotateX(-77deg)",
        }}
      >
        {groups.map((group, i) => (
          <Wheel key={i} {...group} />
        ))}
      </div>
    </div>
  );
}
