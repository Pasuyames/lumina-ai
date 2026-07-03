"use client";

import { useEffect, useState } from "react";

/** Üretim sırasında sırayla gösterilen aşama mesajları — döngüsüz, sonuncuda kalır. */
export const GENERATION_PROGRESS_MESSAGES = [
  "Ürününüz inceleniyor…",
  "Sahne kuruluyor…",
  "Işıklar ayarlanıyor…",
  "Son rötuşlar…",
] as const;

const STEP_MS = 3_500;

/**
 * `active` true olduğu sürece GENERATION_PROGRESS_MESSAGES içinde sırayla
 * ilerler; son mesaja ulaşınca orada kalır (döngü yapmaz). `active` her
 * yeniden true olduğunda (yeni üretim başladığında) ilk mesajdan başlar.
 *
 * "Adjusting state during render" resmi React deseni kullanılıyor —
 * prevActive state'i (ref değil) ile geçiş tespit edilip senkron
 * sıfırlanıyor; efekt yalnızca zamanlayıcıyı yönetiyor.
 */
export function useProgressMessages(active: boolean): string {
  const [index, setIndex] = useState(0);
  const [prevActive, setPrevActive] = useState(active);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setIndex(0);
  }

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((i) =>
        i < GENERATION_PROGRESS_MESSAGES.length - 1 ? i + 1 : i,
      );
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [active]);

  return GENERATION_PROGRESS_MESSAGES[index];
}
