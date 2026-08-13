"use client";

import { MotionConfig } from "motion/react";

/**
 * Uygulama genelinde motion politikası.
 *
 * `reducedMotion="never"`: animasyonlar, işletim sistemindeki "hareketi
 * azalt" tercihinden bağımsız olarak HERKESTE çalışır. Bu bilinçli bir ürün
 * kararı — pazarlama sayfasının kimliği (dönen kart çarkı, kayan şeritler,
 * beliren bölümler) doğrudan harekete dayanıyor ve site sahibi bunun her
 * ziyaretçide aynı görünmesini istedi.
 *
 * ÖNEMLİ: Tercih ne olursa olsun, motion bileşenlerinin İÇİNDE
 * `useReducedMotion()` ile render dallandırması YAPILMAMALI — sunucuda hook
 * daima `false`, istemcide `true` dönebildiği için hydration uyuşmazlığı
 * oluşuyor ve React inline stilleri düzeltmediğinden içerik kalıcı olarak
 * `opacity: 0`'da kalıyor (sayfa bomboş görünüyor). Karar her zaman burada,
 * tek noktadan verilir.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
