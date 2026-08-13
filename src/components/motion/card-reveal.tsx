"use client";

import { motion, type HTMLMotionProps, type Variants } from "motion/react";

const groupVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

type CardRevealGroupProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
};

/**
 * Kart gridleri için kademeli (staggered) giriş kapsayıcısı. İçindeki her
 * `CardReveal` çocuğu, bu kapsayıcı görünüme girdiğinde sırayla belirir.
 *
 * Hareket azaltma tercihi burada DALLANMAYLA ele alınmaz — sunucu/istemci
 * farkı hydration uyuşmazlığı yaratıp içeriği `opacity: 0`'da bırakıyor.
 * Karar kökteki `<MotionConfig reducedMotion="user">` ile veriliyor
 * (bkz. `motion-provider.tsx`).
 */
export function CardRevealGroup({
  children,
  className,
  ...props
}: CardRevealGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={groupVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type CardRevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
};

/** `CardRevealGroup` içinde tek bir kartı saran ölçek + opaklık geçişi. */
export function CardReveal({ children, className, ...props }: CardRevealProps) {
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
