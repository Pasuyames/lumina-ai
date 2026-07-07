"use client";

import { useEffect, useState } from "react";

/** Üretim sırasında sırayla gösterilen aşama mesajları — döngüsüz, sonuncuda kalır. */
export const GENERATION_PROGRESS_MESSAGES = [
  "Ürününüz inceleniyor…",
  "Sahne kuruluyor…",
  "Işıklar ayarlanıyor…",
  "Son rötuşlar…",
] as const;

/**
 * Satış Seti — 4 kare paralel render edildiği için tek görsele göre daha uzun
 * sürer. Son mesajda kalır (döngü yapmaz) — asıl bekleme süresinin çoğu orada geçer.
 */
export const SALES_SET_PROGRESS_MESSAGES = [
  "Ürün analiz ediliyor…",
  "4 kare hazırlanıyor…",
  "Kareler işleniyor — bu 1-2 dakika sürebilir…",
] as const;

const STEP_MS = 3_500;

/**
 * `active` true olduğu sürece verilen mesaj dizisinde sırayla ilerler; son
 * mesaja ulaşınca orada kalır (döngü yapmaz). `active` her yeniden true
 * olduğunda (yeni üretim başladığında) ilk mesajdan başlar. Varsayılan
 * mesaj dizisi GENERATION_PROGRESS_MESSAGES'tır; Satış Seti gibi akışlar
 * kendi mesaj dizisini (`messages`) ve isterse adım süresini (`stepMs`)
 * geçebilir.
 *
 * "Adjusting state during render" resmi React deseni kullanılıyor —
 * prevActive state'i (ref değil) ile geçiş tespit edilip senkron
 * sıfırlanıyor; efekt yalnızca zamanlayıcıyı yönetiyor.
 */
export function useProgressMessages(
  active: boolean,
  messages: readonly string[] = GENERATION_PROGRESS_MESSAGES,
  stepMs: number = STEP_MS,
): string {
  const [index, setIndex] = useState(0);
  const [prevActive, setPrevActive] = useState(active);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setIndex(0);
  }

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((i) => (i < messages.length - 1 ? i + 1 : i));
    }, stepMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- messages genelde sabit modül-seviyesi dizi
  }, [active, stepMs]);

  return messages[index];
}
