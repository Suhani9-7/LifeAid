/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_RAZORPAY_KEY: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
