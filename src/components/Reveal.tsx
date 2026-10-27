import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { EASE_OUT } from "../lib/motion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "span";
}

export function Reveal({ children, delay = 0, y = 24, className = "", as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduced ? 0.2 : 0.9, delay, ease: EASE_OUT }}
    >
      {children}
    </Comp>
  );
}

export function MaskLine({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <span ref={ref} className={`block overflow-hidden pb-[0.06em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: reduced ? 0 : "105%", opacity: reduced ? 0 : 1 }}
        animate={inView ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: reduced ? 0.2 : 1, delay, ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </span>
  );
}
