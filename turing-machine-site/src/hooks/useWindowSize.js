import { useState, useEffect } from "react";

export default function useWindowSize() {
  const [size, setSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
  });

  useEffect(() => {
    const h = () => setSize({ w: window.innerWidth });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return {
    w: size.w,
    isMobile: size.w < 640,
    isTablet: size.w >= 640 && size.w < 900,
  };
}
