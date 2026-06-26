"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  const hideOn = ["/score/book", "/dashboard", "/sign-in", "/sign-up"];
  const shouldHide = hideOn.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (shouldHide) return;
    let lastY = 0;
    const handler = () => {
      const y = window.scrollY;
      setVisible(y > 400 && y < lastY);
      lastY = y;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [shouldHide]);

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-5 z-40 hidden lg:block"
        >
          <Link
            href="/score/book"
            className="flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-5 py-3 shadow-2xl hover:bg-lime/90 transition-all hover:scale-105"
          >
            Take Your Score →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
