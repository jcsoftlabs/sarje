'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Adds `.visible` to `.reveal` elements as they scroll into view. Re-runs on
// route change. Fallback timer guarantees content never stays hidden.
export default function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.visible)'));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => observer.observe(el));

    const fallback = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('visible'));
    }, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [pathname]);

  return null;
}
