import type { Signal, WritableSignal } from '@vanrot/runtime';
import type { FORM_DIAGNOSTIC_CODES } from './constants.js';

export type MaybePromise<T> = T | Promise<T>;

export type FormMessageSource = 'validation' | 'schema' | 'server' | 'resource';

export type FormMessage = {
  source: FormMessageSource;
  message: string;
  code?: string;
};

export type ValidatorResult = string | string[] | FormMessage | FormMessage[] | null | undefined | false;

export type ValidatorContext<T> = {
  value: T;
  path: string;
  formValues: Record<string, unknown>;
};

export type FieldValidator<T> = {
  name: string;
  validate(context: ValidatorContext<T>): ValidatorResult;
};

export type FieldValidatorInput<T> = FieldValidator<T> | ((context: ValidatorContext<T>) => ValidatorResult);

export type FieldPersistence = 'auto' | 'allow' | 'never';

export type FieldOptions<T> = {
  validators?: FieldValidatorInput<T>[];
  asyncValidators?: FormResource<T, ValidatorResult>[];
  persistence?: FieldPersistence;
  label?: string;
};

export type FieldKind = 'field';
export type FieldArrayKind = 'array';
export type FieldGroupKind = 'group';

export type FormField<T = unknown> = {
  kind: FieldKind;
  name: string;
  path: string;
  value: WritableSignal<T>;
  initialValue: Signal<T>;
  dirty: Signal<boolean>;
  touched: Signal<boolean>;
  disabled: WritableSignal<boolean>;
  pending: WritableSignal<boolean>;
  valid: Signal<boolean>;
  invalid: Signal<boolean>;
  errors: Signal<FormMessage[]>;
  messages: Signal<string[]>;
  touch(): void;
  reset(): void;
  validate(options?: ValidateFieldOptions): FormMessage[];
  setServerErrors(messages: string[]): void;
  setSchemaErrors(messages: string[]): void;
  setResourceErrors(messages: string[]): void;
  metadata(): FormFieldMetadata;
  options: FieldOptions<T>;
};

export type InternalFormField<T = unknown> = FormField<T> & {
  setPath(path: string): void;
  setSubmitted(submitted: boolean): void;
  setValidated(validated: boolean): void;
  setInitialValue(value: T): void;
};

export type FieldFactoryMap = Record<string, FormField<any> | FormFieldArray<any> | FieldGroup>;

export interface FieldGroup {
  [key: string]: FormField<any> | FormFieldArray<any> | FieldGroup;
}

export type FieldArrayItem<TFields extends FieldFactoryMap> = {
  key: string;
  fields: TFields;
};

export type FormFieldArray<TFields extends FieldFactoryMap = FieldFactoryMap> = {
  kind: FieldArrayKind;
  name: string;
  path: string;
  items: Signal<Array<FieldArrayItem<TFields>>>;
  add(values?: Partial<FieldValues<TFields>>): FieldArrayItem<TFields>;
  remove(index: number): void;
  move(from: number, to: number): void;
  valid: Signal<boolean>;
  metadata(): FormFieldMetadata;
};

export type InternalFormFieldArray<TFields extends FieldFactoryMap = FieldFactoryMap> = FormFieldArray<TFields> & {
  setPath(path: string): void;
};

export type FieldValues<TFields extends FieldFactoryMap> = {
  [K in keyof TFields]: TFields[K] extends FormField<infer TValue>
    ? TValue
    : TFields[K] extends FormFieldArray<infer TItemFields>
      ? Array<FieldValues<TItemFields>>
      : TFields[K] extends FieldGroup
        ? FieldValues<TFields[K]>
        : never;
};

export type CreateFormOptions<TFields extends FieldFactoryMap = FieldFactoryMap> = {
  name?: string;
  fields: TFields;
  draft?: DraftStorage;
  schemas?: SchemaAdapter[];
};

export type SubmitResult = { ok: boolean; errors?: ServerErrorInput };

export type VanrotForm<TFields extends FieldFactoryMap = FieldFactoryMap> = {
  name?: string;
  fields: TFields;
  submitCount: Signal<number>;
  submitting: Signal<boolean>;
  valid: Signal<boolean>;
  invalid: Signal<boolean>;
  messages: Signal<string[]>;
  values(): FieldValues<TFields>;
  validate(): Promise<boolean>;
  submit(handler?: (values: FieldValues<TFields>) => MaybePromise<SubmitResult | void>): Promise<SubmitResult>;
  reset(): void;
  saveDraft(): Promise<void>;
  restoreDraft(): Promise<void>;
  clearDraft(): Promise<void>;
  metadata(): FormMetadata;
  findField(path: string): FormField<unknown> | undefined;
  setFormErrors(messages: string[]): void;
};

export type InternalVanrotForm<TFields extends FieldFactoryMap = FieldFactoryMap> = VanrotForm<TFields> & {
  fieldMap: Map<string, InternalFormField<unknown>>;
};

export type ValidateFieldOptions = {
  reveal?: boolean;
  formValues?: Record<string, unknown>;
};

export type FormResourceLoader<TInput, TOutput> = (context: {
  value: TInput;
  signal: AbortSignal;
}) => MaybePromise<TOutput>;

export type FormResourceOptions<TInput, TOutput> = {
  name?: string;
  dependsOn?: string[];
  load: FormResourceLoader<TInput, TOutput>;
};

export type FormResource<TInput = unknown, TOutput = unknown> = {
  name?: string;
  dependsOn: string[];
  loading: Signal<boolean>;
  success: Signal<boolean>;
  value: Signal<TOutput | undefined>;
  error: Signal<unknown>;
  stale: Signal<boolean>;
  run(value: TInput): Promise<TOutput | undefined>;
  refresh(): Promise<TOutput | undefined>;
  cancel(): void;
};

export type ServerErrorInput = {
  fields?: Record<string, string[]>;
  form?: string[];
  resources?: Record<string, string[]>;
};

export type DraftAdapter = {
  get(key: string): MaybePromise<string | null>;
  set(key: string, value: string): MaybePromise<unknown>;
  remove(key: string): MaybePromise<unknown>;
};

export type DraftStorage = {
  key: string;
  version: number;
  adapter: DraftAdapter;
};

export type DraftStorageOptions = {
  key: string;
  version: number;
  storage?: 'local' | 'session';
  adapter?: DraftAdapter;
};

export type FormFieldMetadata = {
  path: string;
  kind: FieldKind | FieldArrayKind | FieldGroupKind;
  validators?: string[];
  persistence?: FieldPersistence;
  sensitive?: boolean;
};

export type FormMetadata = {
  kind: typeof import('./constants.js').FORM_METADATA_KIND;
  name?: string;
  fields: FormFieldMetadata[];
  backendContractGenerated: false;
};

export type FormDiagnosticCode = (typeof FORM_DIAGNOSTIC_CODES)[keyof typeof FORM_DIAGNOSTIC_CODES];

export type FormDiagnostic = {
  code: FormDiagnosticCode;
  severity: 'warning' | 'error';
  message: string;
  formPath: string;
  fieldPath?: string;
  source?: {
    file: string;
    line?: number;
    column?: number;
  };
};

export type SchemaAdapterResult = {
  ok: boolean;
  errors?: Record<string, string[]>;
  values?: Record<string, unknown>;
};

export type SchemaAdapter = {
  name: string;
  fields: string[];
  validate(values: Record<string, unknown>): MaybePromise<SchemaAdapterResult>;
};
