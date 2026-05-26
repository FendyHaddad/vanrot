declare const chrome:
  | {
      devtools?: {
        inspectedWindow?: {
          eval: (
            expression: string,
            callback: (result: unknown, exceptionInfo?: { isException?: boolean; value?: unknown }) => void,
          ) => void;
        };
        panels?: {
          create: (title: string, iconPath: string, pagePath: string) => void;
        };
      };
    }
  | undefined;
