const outputTailLength = 4000;

export function createCommandStep({
  name,
  command,
  cwd,
  exitCode,
  stdout,
  stderr,
  required = true,
}) {
  return {
    type: 'command',
    name,
    command,
    cwd,
    exitCode,
    stdoutTail: tail(stdout),
    stderrTail: tail(stderr),
    required,
    status: exitCode === 0 ? 'pass' : 'fail',
  };
}

export function createCheckPassStep({ name, message }) {
  return {
    type: 'check',
    name,
    status: 'pass',
    message,
    required: true,
  };
}

export function createCheckFailureStep({ name, message }) {
  return {
    type: 'check',
    name,
    status: 'fail',
    message,
    required: true,
  };
}

export function createSkippedStep({ name, reason }) {
  return {
    type: 'skip',
    name,
    status: 'skip',
    reason,
    required: false,
  };
}

export function failedRequiredSteps(steps) {
  return steps.filter((step) => step.required && step.status === 'fail');
}

export function summarizeStep(step) {
  if (step.status === 'skip') {
    return `skip ${step.name} - ${step.reason}`;
  }

  if (step.status === 'fail' && step.command !== undefined) {
    return `fail ${step.name} - ${step.command}`;
  }

  if (step.status === 'fail') {
    return `fail ${step.name} - ${step.message}`;
  }

  return `pass ${step.name}`;
}

function tail(value) {
  const text = value ?? '';

  if (text.length <= outputTailLength) {
    return text;
  }

  return text.slice(text.length - outputTailLength);
}
