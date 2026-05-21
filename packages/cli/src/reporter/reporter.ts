export interface Reporter {
  line(text?: string): void;
  heading(title: string, meta?: string): void;
  success(label: string, detail?: string): void;
  warning(filePath: string, message: string): void;
  error(message: string, detail?: string): void;
  nextSteps(steps: string[]): void;
}

export interface MemoryReporter extends Reporter {
  output(): string;
}

export function createMemoryReporter(): MemoryReporter {
  const lines: string[] = [];

  return {
    line(text = '') {
      lines.push(text);
    },
    heading(title, meta) {
      lines.push(meta === undefined ? title : `${title}                                   ${meta}`);
      lines.push('');
    },
    success(label, detail) {
      lines.push(`success ${label}`);

      if (detail !== undefined) {
        lines.push(detail);
      }
    },
    warning(filePath, message) {
      lines.push('warning');
      lines.push(filePath);
      lines.push(message);
      lines.push('');
    },
    error(message, detail) {
      lines.push(`error ${message}`);

      if (detail !== undefined) {
        lines.push(detail);
      }
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }

      lines.push('Next');

      for (const step of steps) {
        lines.push(`> ${step}`);
      }
    },
    output() {
      return lines.join('\n');
    },
  };
}

export function createConsoleReporter(): Reporter {
  return {
    line(text = '') {
      console.log(text);
    },
    heading(title, meta) {
      console.log(meta === undefined ? title : `${title}                                   ${meta}`);
      console.log('');
    },
    success(label, detail) {
      console.log(`success ${label}`);

      if (detail !== undefined) {
        console.log(detail);
      }
    },
    warning(filePath, message) {
      console.log('warning');
      console.log(filePath);
      console.log(message);
      console.log('');
    },
    error(message, detail) {
      console.error(`error ${message}`);

      if (detail !== undefined) {
        console.error(detail);
      }
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }

      console.log('Next');

      for (const step of steps) {
        console.log(`> ${step}`);
      }
    },
  };
}
