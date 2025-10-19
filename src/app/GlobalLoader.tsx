"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // показать спиннер при начале перехода
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
    </div>
  );
}
