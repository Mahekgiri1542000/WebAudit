'use client';
import { useState } from 'react';

export default function CopyShareLink({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/report/${shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copy} className="text-xs text-slate-400 hover:text-slate-300 transition">
      {copied ? '✓ Copied!' : '🔗 Copy Share Link'}
    </button>
  );
}
