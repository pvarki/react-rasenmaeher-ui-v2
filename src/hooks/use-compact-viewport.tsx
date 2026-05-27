import * as React from "react";

const BREAKPOINT = 768;

export function useIsCompactViewport() {
  const [isCompact, setIsCompact] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const widthMql = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const heightMql = window.matchMedia(`(max-height: ${BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsCompact(widthMql.matches || heightMql.matches);
    };
    widthMql.addEventListener("change", onChange);
    heightMql.addEventListener("change", onChange);
    onChange();
    return () => {
      widthMql.removeEventListener("change", onChange);
      heightMql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isCompact;
}
