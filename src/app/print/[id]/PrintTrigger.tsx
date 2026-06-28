'use client';
import { useEffect } from 'react';

export default function PrintTrigger() {
  useEffect(() => {
    // Small delay to ensure page is fully rendered before print dialog opens
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, []);
  return null;
}
