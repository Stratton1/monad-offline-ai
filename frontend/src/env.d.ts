/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_API_URL?: string;
  // Add any custom vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

