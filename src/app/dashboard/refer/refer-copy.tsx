"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ReferCopy({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="flex gap-2">
      <input readOnly value={link} className="flex-1 bg-graphite border border-white/10 text-white/80 font-ui text-sm px-3 py-2.5 rounded-lg" />
      <button onClick={copy} className="inline-flex items-center gap-1.5 bg-lime text-asphalt font-heading font-black text-xs uppercase px-4 rounded-lg hover:bg-lime/90">
        {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
      </button>
    </div>
  );
}
