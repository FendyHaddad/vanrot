import {
  applyServerErrors,
  createDraftStorage,
  createForm,
  createFormResource,
  createFormTest,
  createWizard,
  email,
  field,
  fieldArray,
  minLength,
  required,
} from '@vanrot/forms';

export const emailAvailability = createFormResource<string, string | null>({
  name: 'emailAvailability',
  dependsOn: ['account.email'],
  load: async ({ value, signal }) => {
    await waitForAvailability(signal);

    return value.endsWith('@taken.example') ? 'Email is already taken.' : null;
  },
});

export const checkoutForm = createForm({
  name: 'checkout',
  draft: createDraftStorage({
    key: 'checkout-v1',
    storage: 'session',
    version: 1,
  }),
  fields: {
    account: {
      email: field('', {
        validators: [required(), email()],
        asyncValidators: [emailAvailability],
      }),
      password: field('', {
        validators: [required(), minLength(8)],
        persistence: 'never',
      }),
    },
    items: fieldArray(() => ({
      sku: field('', { validators: [required()] }),
      quantity: field(1),
    })),
    notes: field(''),
  },
});

export const checkoutWizard = createWizard(checkoutForm, [
  {
    name: 'account',
    fields: [checkoutForm.fields.account.email, checkoutForm.fields.account.password],
  },
  {
    name: 'items',
    fields: [],
  },
]);

export function addInvoiceLine(): void {
  checkoutForm.fields.items.add({
    sku: 'A-100',
    quantity: 1,
  });
}

export async function submitCheckout(): Promise<boolean> {
  const result = await checkoutForm.submit(async () => {
    const firstItem = checkoutForm.fields.items.items()[0];

    if (firstItem?.fields.sku.value() === 'A-100') {
      return {
        ok: false,
        errors: {
          fields: {
            'items[0].sku': ['SKU is unavailable.'],
          },
          form: ['Review the unavailable item before submitting.'],
        },
      };
    }

    return { ok: true };
  });

  if (result.errors) {
    applyServerErrors(checkoutForm, result.errors);
  }

  return result.ok;
}

export async function persistDraft(): Promise<void> {
  await checkoutForm.saveDraft();
}

export function createCheckoutFormTest() {
  return createFormTest(checkoutForm);
}

async function waitForAvailability(signal: AbortSignal): Promise<void> {
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 1);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}
