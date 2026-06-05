import { signal } from '@vanrot/runtime';
import type { FormField, VanrotForm } from './types.js';

export type WizardStep = {
  name: string;
  fields: Array<FormField<unknown>>;
};

export type ActiveWizardStep = WizardStep & {
  completed: () => boolean;
  blocked: () => boolean;
};

export type FormWizard = {
  current: () => ActiveWizardStep;
  steps: () => ActiveWizardStep[];
  goTo(name: string): Promise<boolean>;
};

export function createWizard(form: VanrotForm<any>, steps: WizardStep[]): FormWizard {
  const activeSteps = steps.map((step) => {
    const completed = signal(false);
    const blocked = signal(false);

    return {
      ...step,
      completed: () => completed(),
      blocked: () => blocked(),
      setCompleted: completed.set,
      setBlocked: blocked.set,
    };
  });
  const currentIndex = signal(0);

  return {
    current: () => activeSteps[currentIndex()] ?? activeSteps[0]!,
    steps: () => activeSteps,
    goTo: async (name: string) => {
      const current = activeSteps[currentIndex()];

      if (!current) {
        return false;
      }

      const valid = current.fields.every((field) => field.validate({ reveal: true, formValues: form.values() }).length === 0);
      current.setBlocked(!valid);

      if (!valid) {
        return false;
      }

      current.setCompleted(true);
      const nextIndex = activeSteps.findIndex((step) => step.name === name);

      if (nextIndex < 0) {
        return false;
      }

      currentIndex.set(nextIndex);
      return true;
    },
  };
}
