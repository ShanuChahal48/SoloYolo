"use client";
import { useEffect, useState } from "react";
export default function TeamScrollArrows() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    function handleScrollEvent(e: Event) {
      const customEvent = e as CustomEvent<{canScrollLeft: boolean, canScrollRight: boolean}>;
      setCanScrollLeft(customEvent.detail.canScrollLeft);
      setCanScrollRight(customEvent.detail.canScrollRight);
    }
    function checkScrollability() {
      const el = document.getElementById("team-scroll");
      if (el) {
        setCanScrollLeft(el.scrollLeft > 5);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
      }
    }
    window.addEventListener("teamScroll", handleScrollEvent);
    window.addEventListener("resize", checkScrollability);
    // Initial check after mount
    setTimeout(checkScrollability, 100);
    return () => {
      window.removeEventListener("teamScroll", handleScrollEvent);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  return (
    <>
      {canScrollLeft && (
        <button
          type="button"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
          onClick={() => {
            const el = document.getElementById("team-scroll");
            if (el) el.scrollBy({ left: -400, behavior: "smooth" });
          }}
          aria-label="Scroll Left"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all"
          onClick={() => {
            const el = document.getElementById("team-scroll");
            if (el) el.scrollBy({ left: 400, behavior: "smooth" });
          }}
          aria-label="Scroll Right"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
    </>
  );
}