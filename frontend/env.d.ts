/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module 'world-atlas/countries-50m.json' {
  const data: Record<string, unknown>;
  export default data;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCKS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
