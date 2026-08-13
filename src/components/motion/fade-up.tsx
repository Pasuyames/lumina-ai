"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type FadeUpProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /**
   * true ise scroll/IntersectionObserver'a bağlı `whileInView` yerine
   * mount olur olmaz `animate` ile açılır. İlk ekranda (hero gibi) zaten
   * görünür olacak içerik için kullan.
   */
  immediate?: boolean;
};

/**
 * Görünüme girince alttan yukarı yumuşak beliren kapsayıcı. Sadece bir kere
 * tetiklenir (viewport once).
 *
 * ÖNEMLİ — burada `useReducedMotion()` ile dallanma YAPILMAMALI: sunucuda
 * hook her zaman `false` döner, istemcide kullanıcı "hareketi azalt"
 * açıksa `true` döner. İkisi farklı `initial`/`animate` üretince React
 * hydration uyuşmazlığı oluşuyor ve React inline stilleri düzeltmediği
 * için sunucudan gelen `opacity: 0` DOM'da KALICI olarak kalıyor — yani
 * hareketi azalt açık olan herkes için sayfa tamamen boş görünüyordu.
 * Hareket azaltma tercihi bunun yerine kökteki `<MotionConfig
 * reducedMotion="user">` ile ele alınıyor (transform atlanır, opaklık
 * geçişi korunur), bkz. `motion-provider.tsx`.
 */
export function FadeUp({
  children,
  delay = 0,
  immediate = false,
  className,
  ...props
}: FadeUpProps) {
  const target = { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={immediate ? target : undefined}
      whileInView={immediate ? undefined : target}
      viewport={immediate ? undefined : { once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
