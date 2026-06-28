import Link from "next/link";
import { getActiveBanners } from "@/lib/content/queries";

/** Renders the top active banner for a placement (or nothing). Server component. */
export async function Banner({ placement }: { placement: string }) {
  let banners: Awaited<ReturnType<typeof getActiveBanners>> = [];
  try {
    banners = await getActiveBanners(placement);
  } catch {
    return null;
  }
  if (banners.length === 0) return null;
  const b = banners[0];

  return (
    <div className="bg-lime text-asphalt">
      <div className="container max-w-[1440px] py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span className="font-heading font-black text-sm uppercase tracking-wide">{b.title}</span>
        {b.body && <span className="font-ui text-sm">{b.body}</span>}
        {b.ctaLabel && b.ctaHref && (
          <Link href={b.ctaHref} className="font-heading font-black text-xs uppercase underline underline-offset-2 hover:opacity-80">
            {b.ctaLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}
