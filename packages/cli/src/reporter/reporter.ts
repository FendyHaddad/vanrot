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

const LABEL_WIDTH = 8;
const INDENT = ' '.repeat(LABEL_WIDTH + 2);

function labelLine(label: string, content: string): string {
  return `${label.padEnd(LABEL_WIDTH)}  ${content}`;
}

export function createMemoryReporter(): MemoryReporter {
  const lines: string[] = [];

  return {
    line(text = '') {
      lines.push(text);
    },
    heading(title, meta) {
      lines.push(meta === undefined ? title : `${title}  ${meta}`);
      lines.push('');
    },
    success(label, detail) {
      lines.push(labelLine('success', label));

      if (detail === undefined) {
        return;
      }

      lines.push(`${INDENT}${detail}`);
    },
    warning(filePath, message) {
      lines.push(labelLine('warning', filePath));
      lines.push(`${INDENT}${message}`);
    },
    error(message, detail) {
      lines.push(labelLine('error', message));

      if (detail === undefined) {
        return;
      }

      lines.push(`${INDENT}${detail}`);
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }

      for (const step of steps) {
        lines.push(labelLine('next', step));
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
      console.log(meta === undefined ? title : `${title}  ${meta}`);
      console.log('');
    },
    success(label, detail) {
      console.log(labelLine('success', label));

      if (detail === undefined) {
        return;
      }

      console.log(`${INDENT}${detail}`);
    },
    warning(filePath, message) {
      console.log(labelLine('warning', filePath));
      console.log(`${INDENT}${message}`);
    },
    error(message, detail) {
      console.error(labelLine('error', message));

      if (detail === undefined) {
        return;
      }

      console.error(`${INDENT}${detail}`);
    },
    nextSteps(steps) {
      if (steps.length === 0) {
        return;
      }

      for (const step of steps) {
        console.log(labelLine('next', step));
      }
    },
  };
}
