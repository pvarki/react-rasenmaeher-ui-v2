"use client";

import React, { Suspense, lazy, useRef, useCallback } from "react";
import { loadRemoteComponent } from "./remoteComponentLoader";

// Cache for lazy-loaded remote components
const remoteComponentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>
>();

function getOrCreateRemoteComponent(shortname: string) {
  if (!remoteComponentCache.has(shortname)) {
    remoteComponentCache.set(
      shortname,
      lazy(() => loadRemoteComponent(shortname))
    );
  }
  return remoteComponentCache.get(shortname)!;
}

interface RemoteComponentKeepAliveProps {
  shortname: string;
  data: Record<string, unknown>;
  onNavigate: (options: { to: string }) => void;
  fallback: React.ReactNode;
}

/**
 * A wrapper component that keeps the Remote component instance alive
 * by using a stable reference and memoization. This helps preserve internal state
 * like open accordions, form inputs, etc.
 */
export function RemoteComponentKeepAlive({
  shortname,
  data,
  onNavigate,
  fallback,
}: RemoteComponentKeepAliveProps) {
  const Remote = getOrCreateRemoteComponent(shortname);

  // Memoize the navigate function to prevent unnecessary re-renders
  const stableOnNavigate = useCallback(
    (options: { to: string }) => onNavigate(options),
    [onNavigate]
  );

  // Use refs to store data to prevent re-renders when data reference changes
  // but content is the same
  const dataRef = useRef(data);
  const prevDataString = useRef(JSON.stringify(data));

  // Only update dataRef if data actually changed
  const currentDataString = JSON.stringify(data);
  if (currentDataString !== prevDataString.current) {
    dataRef.current = data;
    prevDataString.current = currentDataString;
  }

  return (
    <Suspense fallback={fallback}>
      <Remote
        data={dataRef.current}
        shortname={shortname}
        onNavigate={stableOnNavigate}
      />
    </Suspense>
  );
}
