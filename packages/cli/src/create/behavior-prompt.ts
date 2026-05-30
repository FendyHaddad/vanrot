import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import type { VanrotBehaviorName } from '@vanrot/config';
import { behaviorDefinitions, parseBehaviorList } from '../behavior/catalog.js';

export interface BehaviorSelectionOptions {
  behaviorFlag: string | undefined;
  noBehavior: boolean;
  interactive: boolean;
}

export async function resolveCreateBehaviorSelection(
  options: BehaviorSelectionOptions,
): Promise<VanrotBehaviorName[]> {
  if (options.noBehavior) {
    return [];
  }

  if (options.behaviorFlag !== undefined) {
    return parseBehaviorList(options.behaviorFlag);
  }

  if (!options.interactive) {
    return [];
  }

  const reader = createInterface({ input, output });

  try {
    const wantsBehavior = await reader.question('Add optional @vanrot/behavior helpers? (y/N) ');
    if (wantsBehavior.trim().toLowerCase() !== 'y') {
      return [];
    }

    const menu = behaviorDefinitions
      .map((definition, index) => `${index + 1}. ${definition.name} - ${definition.label}`)
      .join('\n');
    const selected = await reader.question(`${menu}\nPick behavior numbers or names, comma-separated: `);
    const names = selected
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '')
      .map((item) => {
        const index = Number(item) - 1;
        return Number.isInteger(index) && behaviorDefinitions[index] !== undefined
          ? behaviorDefinitions[index].name
          : item;
      })
      .join(',');

    return parseBehaviorList(names);
  } finally {
    reader.close();
  }
}
