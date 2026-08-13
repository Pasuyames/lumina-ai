"use client";

import { motion } from "motion/react";

/**
 * Sürekli, hafif yukarı-aşağı süzülme animasyonu. `delay` ile öğeler arası
 * faz kayması verilir, hepsi aynı anda hareket etmesin diye.
 *
 * Hareket azaltma tercihi burada DALLANMAYLA ele alınmaz (sunucu/istemci
 * farkı hydration uyuşmazlığı yaratır); kökteki `<MotionConfig
 * reducedMotion="user">` transform animasyonlarını zaten devre dışı
 * bırakıyor — bkz. `motion-provider.tsx`.
 */
export function Floating({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
