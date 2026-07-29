import "vite";

declare module "vite" {
  interface ServerOptions {
    allowedHosts?: string[];
  }
}

declare const __APP_VERSION__: string;
