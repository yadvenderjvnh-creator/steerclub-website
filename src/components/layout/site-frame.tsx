"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { FloatingCTA } from "@/components/shared/floating-cta";

// Portal/auth routes render bare (no marketing chrome).
const BARE_PREFIXES = ["/admin", "/dashboard", "/sign-in", "/sign-up"];

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (bare) return <>{children}</>;

  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <MobileBar />
      <FloatingCTA />
    </>
  );
}
