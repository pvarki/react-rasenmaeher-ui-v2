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

/**
 * Load a remote component for admin product pages.
 * Uses /admin-ui/ path which is protected behind mTLS + admin role check in nginx.
 */
export async function loadAdminRemoteComponent(
  shortname: string,
): Promise<{ default: React.ComponentType<RemoteComponentProps> }> {
  const remoteName = `${shortname}-admin-integration`;
  registerRemotes([
    {
      name: remoteName,
      type: "module",
      entry: `/admin-ui/${shortname}/remoteEntry.js`,
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
