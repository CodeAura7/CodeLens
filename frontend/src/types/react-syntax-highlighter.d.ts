declare module 'react-syntax-highlighter' {
  import type { ComponentType, CSSProperties } from 'react';

  export const Prism: ComponentType<{
    children: string;
    language?: string;
    style?: Record<string, CSSProperties>;
    showLineNumbers?: boolean;
    wrapLongLines?: boolean;
  }>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: Record<string, any>;
}
