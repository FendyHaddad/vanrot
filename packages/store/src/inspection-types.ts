import type {
  storeInspectionEventKind,
  storeInspectionSnapshotMode,
} from "./constants.js";
import type { StoreAction } from "./types.js";

export type StoreInspectionEventKind =
  (typeof storeInspectionEventKind)[keyof typeof storeInspectionEventKind];

export type StoreInspectionSnapshotMode =
  (typeof storeInspectionSnapshotMode)[keyof typeof storeInspectionSnapshotMode];

export type StoreInspectionSummary = {
  readonly kind: "hidden" | "value";
  readonly value: unknown;
};

export type StoreInspectionSnapshot<
  TState extends object = Record<string, unknown>,
> = {
  readonly id: string;
  readonly storeName: string;
  readonly label: string | undefined;
  readonly state: TState;
  readonly summary: StoreInspectionSummary;
  readonly sequence: number;
};

export type StoreInspectionEvent<
  TState extends object = Record<string, unknown>,
> = {
  readonly kind: StoreInspectionEventKind;
  readonly protocol: "vanrot.store.inspection.v1";
  readonly sequence: number;
  readonly storeName: string;
  readonly action: StoreAction<any> | undefined;
  readonly actionType: string | undefined;
  readonly payloadSummary: StoreInspectionSummary | undefined;
  readonly previousSnapshotId: string | undefined;
  readonly nextSnapshotId: string | undefined;
  readonly changedKeys: readonly string[];
  readonly effectName: string | undefined;
  readonly concurrencyKey: string | undefined;
  readonly cancellationReason: string | undefined;
  readonly retryAttempt: number | undefined;
  readonly timeoutMs: number | undefined;
  readonly durationMs: number | undefined;
  readonly message: string | undefined;
  readonly state: TState | undefined;
};

export type StoreInspectionObserver<
  TState extends object = Record<string, unknown>,
> = (event: StoreInspectionEvent<TState>) => void;

export type StoreInspectionOptions = {
  readonly enabled?: boolean;
  readonly historyLimit?: number;
  readonly snapshots?: StoreInspectionSnapshotMode;
  readonly exposeState?: boolean;
};

export type StoreInspectionHistory<
  TState extends object = Record<string, unknown>,
> = {
  readonly events: readonly StoreInspectionEvent<TState>[];
  readonly snapshots: readonly StoreInspectionSnapshot<TState>[];
};

export type StoreReplayStep<TState extends object = Record<string, unknown>> = {
  readonly action: StoreAction<any>;
  readonly previousState: TState;
  readonly nextState: TState;
};

export type StoreReplayResult<
  TState extends object = Record<string, unknown>,
> =
  | {
      readonly ok: true;
      readonly initialSnapshotId: string;
      readonly finalState: TState;
      readonly steps: readonly StoreReplayStep<TState>[];
    }
  | {
      readonly ok: false;
      readonly reason: "snapshot-not-found" | "action-not-replayable";
      readonly message: string;
      readonly steps: readonly StoreReplayStep<TState>[];
    };

export type StoreInspector<TState extends object = Record<string, unknown>> = {
  readonly observe: (observer: StoreInspectionObserver<TState>) => () => void;
  readonly history: () => readonly StoreInspectionEvent<TState>[];
  readonly snapshots: () => readonly StoreInspectionSnapshot<TState>[];
  readonly snapshot: (label?: string) => StoreInspectionSnapshot<TState>;
  readonly clearHistory: () => void;
  readonly replayFrom: (snapshotId: string) => StoreReplayResult<TState>;
};
