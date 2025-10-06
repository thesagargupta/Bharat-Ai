"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start loading
    setIsLoading(true);
    setProgress(20);

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(40), 100);
    const timer2 = setTimeout(() => setProgress(60), 200);
    
    // Hide immediately when page is ready (don't wait for 100%)
    const timer3 = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-transparent z-[9999] pointer-events-none"
      style={{
        height: '2px',
        transition: 'opacity 0.2s ease-in-out',
        opacity: isLoading ? 1 : 0,
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-lg"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.4s ease-out',
          boxShadow: '0 0 10px rgba(251, 146, 60, 0.8), 0 0 5px rgba(251, 146, 60, 0.5)',
        }}
      />
    </div>
  );
}
