import type React from "react";
import {
  loadRemote,
  registerRemotes,
} from "@module-federation/enhanced/runtime";
import { RemoteComponentFallback } from "./RemoteComponentFallback";

export interface RemoteComponentProps {
  data?: unknown;
  shortname?: string;
  onNavigate?: (options: { to: string }) => void;
  [key: string]: unknown;
}

export async function loadRemoteComponent(
  shortname: string,
): Promise<{ default: React.ComponentType<RemoteComponentProps> }> {
  const remoteName = `${shortname}-integration`;
  registerRemotes([
    {
      name: remoteName,
      type: "module",
      entry: `/ui/${shortname}/remoteEntry.js`,
    },
  ]);
  try {
    const module = await loadRemote(`${remoteName}/remote-ui`);
    return module as { default: React.ComponentType<RemoteComponentProps> };
  } catch {
    return {
      default: RemoteComponentFallback,
    };
  }
}
