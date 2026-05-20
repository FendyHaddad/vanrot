export interface ReactiveEffect {
  run(): void;
  deps: Set<Set<ReactiveEffect>>;
}

let activeEffect: ReactiveEffect | null = null;
let batchDepth = 0;

const pendingEffects = new Set<ReactiveEffect>();

export function getActiveEffect(): ReactiveEffect | null {
  return activeEffect;
}

export function setActiveEffect(effect: ReactiveEffect | null): ReactiveEffect | null {
  const previousEffect = activeEffect;
  activeEffect = effect;
  return previousEffect;
}

export function trackEffect(subscribers: Set<ReactiveEffect>): void {
  const effect = activeEffect;

  if (effect === null) {
    return;
  }

  subscribers.add(effect);
  effect.deps.add(subscribers);
}

export function triggerEffects(subscribers: ReadonlySet<ReactiveEffect>): void {
  for (const effect of [...subscribers]) {
    if (batchDepth > 0) {
      pendingEffects.add(effect);
      continue;
    }

    effect.run();
  }
}

export function beginBatch(): void {
  batchDepth += 1;
}

export function endBatch(): void {
  if (batchDepth === 0) {
    return;
  }

  batchDepth -= 1;

  if (batchDepth > 0) {
    return;
  }

  const effects = [...pendingEffects];
  pendingEffects.clear();

  for (const effect of effects) {
    effect.run();
  }
}

export function clearEffectDeps(effect: ReactiveEffect): void {
  for (const dep of effect.deps) {
    dep.delete(effect);
  }

  effect.deps.clear();
}
