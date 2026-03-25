"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokens } from "@/lib/state/token-context";
import type { ColorSchemeMode, PreviewMode } from "@/lib/tokens/types";
import { PreviewIframe, type PreviewIframeHandle } from "./preview-iframe";

function useIsLg() {
  const [isLg, setIsLg] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLg(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isLg;
}

export function PreviewArea() {
  const { colorSchemeMode, previewMode, dispatch } = useTokens();
  const lightRef = useRef<PreviewIframeHandle>(null);
  const darkRef = useRef<PreviewIframeHandle>(null);
  const isLg = useIsLg();
  const [mobileSchemeTab, setMobileSchemeTab] = useState<"light" | "dark">(
    "light",
  );

  // Content height for shared scroll container in "both" mode
  const [contentHeight, setContentHeight] = useState(0);
  const heightsRef = useRef({ light: 0, dark: 0 });

  const handleLightHeight = useCallback((height: number) => {
    heightsRef.current.light = height;
    setContentHeight(Math.max(heightsRef.current.light, heightsRef.current.dark));
  }, []);

  const handleDarkHeight = useCallback((height: number) => {
    heightsRef.current.dark = height;
    setContentHeight(Math.max(heightsRef.current.light, heightsRef.current.dark));
  }, []);

  const showBothSideBySide = colorSchemeMode === "both" && isLg;
  const showMobileTabs = colorSchemeMode === "both" && !isLg;

  // Tell iframes to disable internal scrolling when in shared container mode
  useEffect(() => {
    if (showBothSideBySide) {
      const timer = setTimeout(() => {
        lightRef.current?.setScrollMode("external");
        darkRef.current?.setScrollMode("external");
      }, 200);
      return () => clearTimeout(timer);
    } else {
      lightRef.current?.setScrollMode("internal");
      darkRef.current?.setScrollMode("internal");
    }
  }, [showBothSideBySide]);

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <div className="flex items-center gap-2 text-foreground">
          <div className="w-[90px] h-[50px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 493 275"
            >
              <title>Steez</title>
              <path
                fill="currentColor"
                d="M 89.1 2.7 L 95.5 16.7 l -1.6 6.3 c -0.5 5.5 -1.6 7.4 -1.6 7.4 c -1.4 1.9 -0.3 4.4 -2.7 6.9 c 0 0 -2.5 2.5 -1.6 7.4 c 0.5 3 -0.5 5.5 -0.5 5.5 c -1.4 2.5 1.4 7.7 0 10.1 c 0 0 -1.1 2.5 -1.1 13.4 l -5.2 35.4 l -2.7 -29.6 l -4.4 -11.2 c -0.3 -9.9 -1.1 -11.8 -1.1 -11.8 c -0.8 -1.9 -1.4 -8.8 -2.2 -11.2 c -0.3 -0.8 -0.5 -1.9 -0.8 -3 c -0.5 -0.5 -0.8 -1.4 -0.5 -1.9 v -0.5 s 0 -1.1 -0.3 -1.9 l -0.3 -6.9 l -0.5 -3.6 c -1.1 -0.5 -2.5 -0.8 -4.1 0.3 c -1.6 0.8 -3 1.6 -4.1 2.2 c -0.3 0.5 -0.5 1.4 -1.1 1.9 c -1.1 1.4 -0.3 3.3 -2.7 5.2 c 0 0 -2.2 2.2 -1.6 6 c 0.8 2.5 -0.5 4.4 -0.5 4.4 c -1.1 1.9 1.6 6 0.3 8 c 0 0 -1.4 1.9 -1.1 11 l -5.5 28 l -2.7 -23.6 l -4.4 -9.1 c 0 -7.7 -1.1 -9.3 -1.1 -9.3 c -0.8 -1.4 -1.4 -6.9 -2.2 -8.8 c 0 0 -1.1 -1.9 -1.4 -6 l -0.3 -2.5 l -9.3 5.2 v 9.6 l -2.2 -3.6 v 0.5 c 0.8 3.3 -0.5 5.8 -0.5 5.8 c 0 0.3 -0.3 0.8 -0.3 1.1 c 0.3 0.3 0.3 0.5 0.3 0.8 c 0 0 2.7 5.5 6.9 21.1 L 34.6 86.4 c 2.7 6.9 5.5 11 5.5 11 c 2.7 4.4 1.4 9.9 4.1 15.4 c 2.7 5.5 1.4 4.1 2.7 9.6 c 1.4 5.8 -1.4 7.1 4.1 16.7 c 5.8 9.9 1.4 8.2 7.1 16.7 c 0 0 5.5 8.2 8.2 16.5 c 3.8 5.5 5.5 11.2 5.5 11.2 l 1.9 5.5 l 8 18.1 l -0.3 4.1 c 1.4 2.2 3 4.1 4.7 5.8 v 0.3 s -1.6 1.6 -1.1 5.2 c 0.5 2.2 -0.3 4.1 -0.3 4.1 c -0.8 1.6 0.8 5.2 0 7.1 c 0 0 -0.8 1.6 -0.8 9.9 L 81.2 265 l -0.3 1.9 v 4.9 l -6 2.5 c -6.3 0 -12.6 -2.2 -12.6 -2.2 c -6.3 -1.9 0 0 -5.2 -0.8 c -5.2 -1.1 -4.1 -1.1 -7.4 -1.1 c 0 0 -3 0 -5.2 -2.2 l -5.2 4.1 l -15.6 -0.3 l -0.3 0.3 l -6.3 -0.3 l -6.3 0.3 c 0 -5.2 1.1 -8.2 1.1 -8.2 c 1.1 -3.3 -1.1 1.1 0 -8.5 c 0 0 1.1 -9.3 0 -14.5 c -3 -8.2 -1.9 -12.6 -1.9 -12.6 s 0.8 -4.1 0 -19.7 l 0.5 -15.1 c 0.3 -3 0.3 -8.5 -0.3 -9.9 c -0.5 -1.9 -0.5 -8.8 -1.1 -11.5 c 0 0 -0.5 -2.5 -0.5 -7.4 v -6.9 l -0.5 -9.1 l -1.1 -3.6 l -0.8 -7.1 l 1.9 -4.9 l 8.8 -5.2 l 7.4 1.6 L 27.7 144 l -1.4 6.3 c -0.5 5.5 -1.4 7.4 -1.4 7.4 c -1.1 1.9 -0.5 4.4 -2.2 6.9 c 0 0 -1.9 2.5 -1.6 7.4 c 0.3 3.3 -0.5 5.5 -0.5 5.5 c -1.1 2.5 0.5 7.7 -0.3 10.1 c 0 0 -1.1 2.5 -1.6 13.7 l -1.6 11.8 v 0.5 s 1.1 3 4.4 19.7 c 0 5.2 1.9 8.5 1.9 8.5 c 1.4 1.9 3.3 11.5 4.4 17.6 l 2.2 1.1 H 42.2 c 4.4 0 11.5 2.2 11.5 2.2 c 7.4 2.2 6.3 0 10.4 0 c 4.4 0 10.7 1.1 11.5 -2.2 c 0.5 -1.1 1.6 -7.1 2.7 -13.7 l -2.5 -7.4 c -0.3 -7.1 -0.8 -8.5 -0.8 -8.5 c -0.5 -1.4 -0.8 -6.3 -1.4 -8 c 0 0 -0.8 -1.9 -0.8 -5.5 l -0.3 -1.4 C 67.7 205.2 61.7 192 60.9 189 c -1.4 -5.5 -19.5 -47.2 -20.8 -52.7 c -1.4 -5.5 -5.5 -12.3 -6.9 -18.1 c -1.4 -5.5 -8.5 -13.7 -9.9 -17.8 c -0.5 -1.6 -1.6 -4.7 -3.3 -7.7 l -3 21.7 l -2.7 -31.3 l -4.4 -11.5 c 0 -10.4 -1.1 -12.3 -1.1 -12.3 c -0.8 -1.9 -1.4 -9.1 -2.2 -11.8 c 0 0 -1.1 -2.5 -1.4 -7.7 l -0.5 -7.1 l -1.4 -9.1 l -1.6 -4.1 L 0 12.3 L 2.5 7.1 l 9.6 -4.4 C 12.9 1.4 13.7 0.5 14.8 1.4 L 25.5 2.7 l 0.3 0.5 S 31 2.2 35.9 0 c 26.6 4.1 34.6 2.7 34.6 2.7 c 1.6 -0.3 3.3 -0.3 4.7 0.3 l 3.6 -1.6 z"
              />
              <path
                fill="currentColor"
                d="M 212.8 17.3 v 3.8 c -0.5 0.8 -1.4 1.9 -1.4 1.9 c -0.3 0.8 -0.5 1.4 -0.8 1.9 c -1.1 1.1 -0.5 2.7 -1.9 4.4 a 10.4 10.4 0 0 0 0 4.1 l 1.4 5.8 l -2.7 9.9 c -0.5 -0.3 -1.4 -0.5 -1.4 -0.5 c -0.3 0 -0.3 0.3 -0.3 0.3 s -1.4 1.9 -1.1 11 l -5.5 28.3 l -2.7 -23.9 l -4.4 -9.1 c 0 -8 -1.1 -9.3 -1.1 -9.3 c -0.8 -1.6 -1.4 -7.1 -2.2 -9.1 c 0 0 -1.1 -1.9 -1.4 -6 l -0.3 -1.4 s -6 2.7 -10.4 2.7 h -8.8 l -3.3 4.9 l 0.5 3.6 l -1.6 15.6 c -1.4 14 -1.9 18.9 -1.9 18.9 c -1.1 4.7 -0.3 11 -2.7 17.3 c 0 0 -2.5 6.3 -1.6 18.7 c 0.5 8 -0.5 14.3 -0.5 14.3 c -1.4 6.3 1.6 18.7 0.3 25 c 0 0 0.3 6.3 -1.4 34.6 l -5.2 89.4 l -2.7 -75.2 l -4.4 -28.3 c -0.3 -25.2 -1.1 -29.9 -1.1 -29.9 c -1.1 -4.7 -1.9 -21.9 -2.2 -28.3 c 0 0 -1.4 -6.3 -1.6 -18.9 l -0.5 -17 l -1.4 -22.2 l -1.6 -9.3 l -1.1 -13.2 h -3.3 c -4.7 0 -10.7 -2.7 -10.7 -2.7 v 1.4 c -0.5 4.1 -1.6 6 -1.6 6 c -0.8 1.9 -1.4 7.4 -2.2 9.1 c 0 0 -0.8 1.4 -1.1 9.3 l -4.4 9.1 l -2.7 23.9 l -5.2 -28.3 c 0 -9.1 -1.4 -11 -1.4 -11 v -0.3 l -1.6 0.5 l -2.7 -9.9 l 1.4 -5.8 c 0.5 -1.4 0.3 -2.7 0 -4.1 c -1.1 -1.6 -0.8 -3.3 -1.9 -4.4 c -0.3 -0.5 -0.5 -1.1 -0.8 -1.9 c 0 0 -0.8 -1.1 -1.4 -1.9 v -3.8 l -1.1 -3.3 l 1.1 -2.2 v -1.9 c 0.8 -0.8 2.2 -1.9 2.2 -1.9 l 3 -5.5 L 109.6 1.4 l 4.7 1.6 S 125 3.3 145.6 0 c 3.6 1.6 7.7 2.7 7.7 2.7 s 4.4 -1.1 7.7 -2.7 c 20.8 3.3 31.3 3 31.3 3 l 4.7 -1.6 L 207.5 2.5 l 3.3 5.5 l 1.9 1.9 v 1.9 l 1.1 2.2 z"
              />
              <path
                fill="currentColor"
                d="M 301.7 164 l 5.2 14.8 l -1.4 6.3 c -0.3 5.8 -1.4 7.7 -1.4 7.7 c -1.1 1.9 -0.3 4.4 -2.5 7.1 c 0 0 -1.9 2.5 -1.4 7.7 c 0.5 3 -0.5 5.8 -0.5 5.8 c -0.8 2.5 1.4 7.7 0.3 10.1 c -0.5 1.6 -0.8 6.3 -0.8 9.9 l 3.6 26.3 l 0.8 5.8 l -6.9 2.7 h -1.4 l -0.8 6 l -0.3 -6 c -3 -0.3 -12.6 -2.5 -12.6 -2.5 l -6 -1.1 c -6.3 -1.1 -5.2 -1.1 -8.8 -1.1 c 0 0 -3.6 0 -6.3 -2.5 l -5.8 4.7 l -26.1 -0.3 c 0.3 -1.1 0.3 -6.9 0 -14.8 l -0.8 14.8 l -2.7 -73.2 l -4.1 -27.4 c -0.3 -24.4 -1.1 -29.1 -1.1 -29.1 c -0.8 -3.6 -1.1 -14.5 -1.6 -22.2 c -0.3 -2.2 -0.5 -3.8 -0.5 -5.2 c 0 0 -1.1 -6 -1.4 -18.4 l -0.5 -16.7 l -1.4 -21.4 l -1.6 -9.1 l -1.6 -16.7 l 2.5 -12.3 L 225.7 0 l 10.4 3 l 0.3 1.1 s 5.5 -1.1 11.8 -3.8 c 25.2 4.1 32.9 2.7 32.9 2.7 c 0.5 -0.3 1.1 -0.3 1.6 -0.3 L 288.6 0 l 10.4 1.4 l 6 14.5 l -1.4 6.6 c -0.5 5.8 -1.9 7.7 -1.9 7.7 c -1.1 1.9 -0.3 4.4 -2.7 7.1 c 0 0 -2.2 2.5 -1.6 7.7 c 0.8 3 -0.5 5.8 -0.5 5.8 c -1.1 2.5 1.6 7.7 0.3 10.1 c 0 0 -1.4 2.7 -1.1 14.3 l -5.2 36.5 l -2.7 -30.7 l -4.4 -11.5 c 0 -10.4 -1.1 -12.3 -1.1 -12.3 c -0.8 -1.9 -1.1 -9.1 -1.9 -11.5 c 0 0 -1.4 -2.5 -1.6 -7.7 l -0.3 -7.1 l -0.8 -3.8 c -0.8 -0.3 -1.6 -0.3 -3 0.5 c 0 0 -6.9 4.1 -12.1 4.1 h -9.1 l -11.2 6.3 v 0.3 l -1.6 15.4 c -1.4 13.4 -1.6 18.1 -1.6 18.1 c -1.4 4.7 -0.5 10.7 -2.7 16.7 c -1.4 3.8 -1.6 9.6 -1.9 13.7 l 2.2 -2.7 c 5.2 -2.5 5.8 -3.6 5.8 -3.6 c 0.8 -0.8 4.1 -2.7 5.2 -4.1 c 0 0 0.8 -1.1 3.3 -2.7 l 3.6 -1.9 l 0.3 -0.3 l 1.9 -3.8 l 6 -3 l 0.3 -0.3 h 0.3 l 1.9 -1.1 l 7.1 1.1 l 4.4 11 l -1.1 4.9 c -0.3 4.4 -1.1 5.8 -1.1 5.8 c -1.1 1.6 -0.3 3.6 -1.9 5.5 c 0 0 -1.6 1.9 -1.4 5.8 c 0.5 2.5 -0.3 4.4 -0.3 4.4 c -0.8 1.9 1.1 5.8 0 7.7 c 0 0 -0.8 1.9 -0.8 10.7 l -3.6 27.7 l -1.9 -23.3 l -3 -8.8 c 0 -7.7 -0.8 -9.1 -0.8 -9.1 c -0.5 -1.6 -0.8 -6.9 -1.4 -8.8 c 0 0 -0.8 -1.9 -1.1 -5.8 l -0.3 -5.5 v -0.5 c -0.3 0 -0.5 -0.3 -0.8 -0.3 c 0 0 -1.9 -0.8 -4.4 0.8 c -1.4 1.1 -3 1.1 -3 1.1 c -1.6 -0.3 -3.3 2.7 -4.9 2.5 c 0 0 -1.6 0 -7.4 2.7 l -2.7 0.8 c 0.3 2.7 0.3 7.4 -0.5 11.5 c -1.4 6.3 1.4 18.4 0 24.4 c 0 0 0.5 6.3 -1.1 33.7 l -3 51 v 2.2 c -1.1 5.2 3.3 6.3 3.6 10.7 c 0 0 0 4.7 1.1 5.8 l 8.5 4.7 h 14.3 c 4.9 0 13.4 2.2 13.4 2.2 c 8.5 2.5 7.1 0 11.8 0 c 3.3 0 7.7 0.5 10.4 -0.3 l -0.8 -11.2 l -3.6 -11.5 c -0.3 -10.4 -1.1 -12.3 -1.1 -12.3 c -0.8 -1.9 -1.1 -9.1 -1.9 -11.5 c 0 0 -0.8 -2.5 -1.1 -7.7 l -0.3 -7.1 l -1.4 -8.8 l -1.4 -3.8 l -1.4 -7.1 l 2.2 -5.2 l 10.4 -5.8 z"
              />
              <path
                fill="currentColor"
                d="M 394.6 164 l 5.2 14.8 l -1.4 6.3 c -0.3 5.8 -1.4 7.7 -1.4 7.7 c -1.1 1.9 -0.3 4.4 -2.5 7.1 c 0 0 -1.9 2.5 -1.4 7.7 c 0.5 3 -0.5 5.8 -0.5 5.8 c -0.8 2.5 1.4 7.7 0.3 10.1 c -0.5 1.6 -0.8 6.3 -0.8 9.9 l 3.6 26.3 l 0.8 5.8 l -6.9 2.7 h -1.4 l -0.8 6 l -0.3 -6 c -3 -0.3 -7.7 -0.8 -12.6 -2.5 c -7.4 -2.2 0 0 -6 -1.1 c -6.3 -1.1 -5.2 -1.1 -8.8 -1.1 c 0 0 -3.6 0 -6.3 -2.5 l -5.8 4.7 l -26.1 -0.3 c 0.3 -1.1 0.3 -6.9 0 -14.8 l -0.8 14.8 l -2.7 -73.2 l -4.1 -27.4 c -0.3 -24.4 -1.1 -29.1 -1.1 -29.1 c -0.8 -3.6 -1.1 -14.5 -1.6 -22.2 c -0.3 -2.2 -0.5 -3.8 -0.5 -5.2 c 0 0 -1.1 -6 -1.4 -18.4 l -0.5 -16.7 l -1.4 -21.4 l -1.6 -9.1 l -1.6 -16.7 l 2.5 -12.3 L 318.6 0 l 10.4 3 l 0.3 1.1 s 5.5 -1.1 11.8 -3.8 c 25.2 4.1 32.9 2.7 32.9 2.7 c 0.5 -0.3 1.1 -0.3 1.6 -0.3 L 381.4 0 l 10.4 1.4 l 6 14.5 l -1.4 6.6 c -0.5 5.8 -1.9 7.7 -1.9 7.7 c -1.1 1.9 -0.3 4.4 -2.7 7.1 c 0 0 -2.2 2.5 -1.6 7.7 c 0.8 3 -0.5 5.8 -0.5 5.8 c -1.1 2.5 1.6 7.7 0.3 10.1 c 0 0 -1.4 2.7 -1.1 14.3 l -5.2 36.5 l -2.7 -30.7 l -4.4 -11.5 c 0 -10.4 -1.1 -12.3 -1.1 -12.3 c -0.8 -1.9 -1.1 -9.1 -1.9 -11.5 c 0 0 -1.4 -2.5 -1.6 -7.7 l -0.3 -7.1 l -0.8 -3.8 c -0.8 -0.3 -1.6 -0.3 -3 0.5 c 0 0 -6.9 4.1 -12.1 4.1 h -9.1 l -11.2 6.3 v 0.3 l -1.6 15.4 c -1.4 13.4 -1.6 18.1 -1.6 18.1 c -1.4 4.7 -0.5 10.7 -2.7 16.7 c -1.4 3.8 -1.6 9.6 -1.9 13.7 l 2.2 -2.7 c 5.2 -2.5 5.8 -3.6 5.8 -3.6 c 0.8 -0.8 4.1 -2.7 5.2 -4.1 c 0 0 0.8 -1.1 3.3 -2.7 l 3.6 -1.9 l 0.3 -0.3 l 1.9 -3.8 l 6 -3 l 0.3 -0.3 h 0.3 l 1.9 -1.1 l 7.1 1.1 l 4.4 11 l -1.1 4.9 c -0.3 4.4 -1.1 5.8 -1.1 5.8 c -1.1 1.6 -0.3 3.6 -1.9 5.5 c 0 0 -1.6 1.9 -1.4 5.8 c 0.5 2.5 -0.3 4.4 -0.3 4.4 c -0.8 1.9 1.1 5.8 0 7.7 c 0 0 -0.8 1.9 -0.8 10.7 l -3.6 27.7 l -1.9 -23.3 l -3 -8.8 c 0 -7.7 -0.8 -9.1 -0.8 -9.1 c -0.5 -1.6 -0.8 -6.9 -1.4 -8.8 c 0 0 -0.8 -1.9 -1.1 -5.8 l -0.3 -5.5 v -0.5 c -0.3 0 -0.5 -0.3 -0.8 -0.3 c 0 0 -1.9 -0.8 -4.4 0.8 c -1.4 1.1 -3 1.1 -3 1.1 c -1.6 -0.3 -3.3 2.7 -4.9 2.5 c 0 0 -1.6 0 -7.4 2.7 l -2.7 0.8 c 0.3 2.7 0.3 7.4 -0.5 11.5 c -1.4 6.3 1.4 18.4 0 24.4 c 0 0 0.5 6.3 -1.1 33.7 l -3 51 v 2.2 c -1.1 5.2 3.3 6.3 3.6 10.7 c 0 0 0 4.7 1.1 5.8 l 8.5 4.7 h 14.3 c 4.9 0 13.4 2.2 13.4 2.2 c 8.5 2.5 7.1 0 11.8 0 c 3.3 0 7.7 0.5 10.4 -0.3 l -0.8 -11.2 l -3.6 -11.5 c -0.3 -10.4 -1.1 -12.3 -1.1 -12.3 c -0.8 -1.9 -1.1 -9.1 -1.9 -11.5 c 0 0 -0.8 -2.5 -1.1 -7.7 l -0.3 -7.1 l -1.4 -8.8 l -1.4 -3.8 l -1.4 -7.1 l 2.2 -5.2 l 10.4 -5.8 z"
              />
              <path
                fill="currentColor"
                d="M 490 7.1 l 2.5 5.2 l -1.4 7.1 l -1.9 4.1 l -1.4 9.1 l -0.5 7.1 c -0.3 5.2 -1.4 7.7 -1.4 7.7 c -0.8 2.7 -1.4 9.9 -2.2 11.8 c 0 0 -0.8 1.9 -1.1 12.3 l -4.4 11.5 l -2.7 31.3 l -3 -21.7 c -1.4 3 -2.7 6 -3.3 7.7 c -1.4 4.1 -8.2 12.3 -9.9 17.8 c -1.4 5.5 -5.5 12.6 -6.9 18.1 c 0.5 -0.3 0.8 -0.8 1.1 -1.1 c 0 0 1.1 -1.1 4.7 -3.6 l 3.8 -2.7 l 11 -2.7 l 3.3 3.8 l -0.5 7.1 l -2.7 2.7 l -4.9 1.9 l -3 0.8 l -6 2.5 l -4.7 2.5 c -3.6 1.6 -5.5 1.9 -5.5 1.9 c -0.3 0.3 -0.3 0.3 -0.5 0.3 v 0.3 s 0.5 1.9 5.5 8.5 l 13.2 22.5 l -13.7 -17 l -6.6 -5.2 c -0.8 -1.4 -1.9 -2.5 -1.9 -2.5 c -5.5 13.4 -12.3 29.3 -13.2 32.6 c -0.5 3 -6.6 16.2 -11.8 27.2 v 1.4 c -0.3 3.6 -1.1 5.5 -1.1 5.5 c -0.5 1.6 -0.8 6.6 -1.4 8 c 0 0 -0.5 1.4 -0.8 8.5 l -2.5 7.4 c 1.1 6.6 2.2 12.6 2.7 13.7 c 1.1 3.3 7.4 2.2 11.5 2.2 s 3 2.2 10.4 0 c 0 0 7.4 -2.2 11.5 -2.2 h 12.3 l 2.2 -1.1 c 1.1 -6 3 -15.6 4.4 -17.6 c 0 0 2.2 -3.3 2.2 -8.5 c 3 -16.7 4.1 -19.7 4.1 -19.7 c 1.1 -3 -2.2 -18.9 1.9 -20.8 c 2.7 -1.4 2.7 -24.7 2.5 -39.5 c 0.3 3 0.5 6.3 0.8 8 c 1.1 5.2 -1.1 10.7 0 14.8 c 0 0 0.8 4.1 1.1 9.3 l 1.1 23 c -1.1 15.6 0 19.7 0 19.7 s 0.8 4.4 -2.2 12.6 c -1.1 5.2 0 14.5 0 14.5 c 1.1 9.6 -1.1 5.2 0 8.5 c 0 0 1.1 3 1.1 8.2 l -6.3 -0.3 l -6.3 0.3 l -0.3 -0.3 l -15.6 0.3 l -5.2 -4.1 c -1.9 2.2 -5.2 2.2 -5.2 2.2 c -3 0 -2.2 0 -7.4 1.1 c -5.2 0.8 1.1 -1.1 -5.2 0.8 c 0 0 -6.3 2.2 -12.3 2.2 l -6 -2.5 l -0.3 -4.9 v -1.9 l -3 -21.4 c 0 -8.2 -0.8 -9.9 -0.8 -9.9 c -0.8 -1.9 1.1 -5.5 0.3 -7.1 c 0 0 -0.8 -1.9 -0.5 -4.1 c 0.5 -3.6 -1.1 -5.2 -1.1 -5.2 v -0.3 c 1.9 -1.6 3.3 -3.6 4.7 -5.8 v -4.1 l 7.7 -18.1 l 1.9 -5.5 s 1.9 -5.8 5.5 -11.2 c 2.7 -8.2 8.2 -16.5 8.2 -16.5 s -0.8 0.5 -1.6 0.8 l -8.5 2.5 l -20.6 9.9 l 22.5 -15.4 c 7.4 -3.8 8.8 -5.5 8.8 -5.5 c 0.3 -0.3 1.1 -0.5 1.6 -1.1 c -0.5 -0.3 -0.8 -0.8 -1.1 -1.1 c 0 0 -1.6 -1.1 -3.8 -3.8 l -3 -4.1 l -4.4 -4.7 l -2.2 -1.6 l -3.6 -3.6 l -1.4 -3.8 l 2.5 -6.6 l 4.4 -2.2 l 8.8 6.6 l 1.9 4.1 c 2.2 3.6 2.7 4.9 2.7 4.9 c 0.3 1.4 1.6 2.7 1.9 4.9 c 0 1.4 1.1 2.7 1.6 3.8 c 0.3 -0.3 0.3 -0.5 0.5 -0.8 c 5.5 -9.6 2.7 -11 4.1 -16.7 c 1.4 -5.5 0 -4.1 2.7 -9.6 s 1.4 -11 4.1 -15.4 c 0 0 2.7 -4.1 5.5 -11 l 4.4 -10.7 c 4.1 -15.6 6.9 -21.1 6.9 -21.1 c 0 -0.3 0.3 -0.5 0.3 -0.8 s 0 -0.8 -0.3 -1.1 c 0 0 -1.4 -2.5 -0.5 -5.8 v -0.5 l -2.2 3.6 v -9.6 l -15.4 -8.5 h -9.6 c -5.5 0 -12.6 -4.1 -12.6 -4.1 c -1.9 -1.1 -3.3 -0.8 -4.1 -0.3 l -0.8 3.6 l -0.3 6.9 c 0 0.8 -0.3 1.9 -0.3 1.9 v 0.5 c 0.3 0.5 0 1.4 -0.5 1.9 c -0.3 1.1 -0.5 2.2 -0.8 3 c -0.8 2.5 -1.1 9.3 -2.2 11.2 c 0 0 -0.8 1.9 -1.1 11.8 l -4.4 11.2 l -2.5 29.6 l -5.5 -35.4 c 0.3 -11 -1.1 -13.4 -1.1 -13.4 c -1.4 -2.5 1.4 -7.7 0 -10.1 c 0 0 -1.1 -2.5 -0.3 -5.5 c 0.5 -4.9 -1.9 -7.4 -1.9 -7.4 c -2.2 -2.5 -1.4 -4.9 -2.7 -6.9 c 0 0 -1.1 -1.9 -1.6 -7.4 l -1.6 -6.3 l 6.3 -14 l 10.4 -1.4 l 3.6 1.6 c 1.4 -0.5 3 -0.5 4.7 -0.3 c 0 0 8.2 1.4 34.6 -2.7 c 5.2 2.2 10.1 3.3 10.1 3.3 l 0.3 -0.5 l 10.7 -1.4 c 1.1 -0.8 1.9 0 2.7 1.4 z m -10.1 146.2 s -0.3 -6.3 -0.3 -12.9 c 0.3 5.5 0.3 12.9 0.3 12.9"
              />
            </svg>
          </div>
          <span className="uppercase text-xl text-foreground tracking-tight">
            :: the rek-room combobulator ::
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={previewMode}
            onValueChange={(v) =>
              dispatch({ type: "SET_PREVIEW_MODE", mode: v as PreviewMode })
            }
          >
            <TabsList>
              <TabsTrigger value="vignettes">Vignettes</TabsTrigger>
              <TabsTrigger value="kitchen-sink">Kitchen Sink</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs
            value={colorSchemeMode}
            onValueChange={(v) =>
              dispatch({
                type: "SET_COLOR_SCHEME_MODE",
                mode: v as ColorSchemeMode,
              })
            }
          >
            <TabsList>
              <TabsTrigger value="light">Light</TabsTrigger>
              <TabsTrigger value="dark">Dark</TabsTrigger>
              <TabsTrigger value="both">Both</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Mobile tab switcher — only when "both" on small screens */}
      {showMobileTabs && (
        <div className="flex border-b bg-muted/30">
          <button
            className={`flex-1 py-1.5 text-sm font-medium transition-colors ${mobileSchemeTab === "light" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"}`}
            onClick={() => setMobileSchemeTab("light")}
          >
            Light
          </button>
          <button
            className={`flex-1 py-1.5 text-sm font-medium transition-colors ${mobileSchemeTab === "dark" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground"}`}
            onClick={() => setMobileSchemeTab("dark")}
          >
            Dark
          </button>
        </div>
      )}

      {/* Iframe container */}
      {showBothSideBySide ? (
        /* Shared scrolling container — iframes stretch to full content height, container scrolls them together */
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div
            className="flex"
            style={{ height: contentHeight > 0 ? contentHeight : "100%" } as CSSProperties}
          >
            <PreviewIframe
              ref={lightRef}
              colorScheme="light"
              onContentHeight={handleLightHeight}
              className="flex-1"
              style={{ height: contentHeight > 0 ? contentHeight : "100%" }}
            />
            <div className="w-px bg-border shrink-0" />
            <PreviewIframe
              ref={darkRef}
              colorScheme="dark"
              onContentHeight={handleDarkHeight}
              className="flex-1"
              style={{ height: contentHeight > 0 ? contentHeight : "100%" }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {showMobileTabs ? (
            mobileSchemeTab === "light" ? (
              <PreviewIframe ref={lightRef} colorScheme="light" className="flex-1" />
            ) : (
              <PreviewIframe ref={darkRef} colorScheme="dark" className="flex-1" />
            )
          ) : (
            <>
              {(colorSchemeMode === "light" || colorSchemeMode === "both") && (
                <PreviewIframe ref={lightRef} colorScheme="light" className="flex-1" />
              )}
              {(colorSchemeMode === "dark" || colorSchemeMode === "both") && (
                <PreviewIframe ref={darkRef} colorScheme="dark" className="flex-1" />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
