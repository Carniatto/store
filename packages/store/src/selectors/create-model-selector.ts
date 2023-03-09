import { createSelector } from '../utils/selector-utils';
import { ensureValidSelector, ensureValueProvided } from './selector-checks.util';
import { TypedSelector } from './selector-types.util';

interface SelectorMap {
  [key: string]: TypedSelector<any>;
}

type ModelSelector<T extends SelectorMap> = (...args: any[]) => MappedResult<T>;

type MappedResult<TSelectorMap> = {
  [P in keyof TSelectorMap]: TSelectorMap[P] extends TypedSelector<infer R> ? R : never;
};

export function createModelSelector<T extends SelectorMap>(selectorMap: T): ModelSelector<T> {
  const prefix = '[createModelSelector]';
  const selectorKeys = Object.keys(selectorMap);
  ensureValueProvided(selectorMap, { prefix, noun: 'selector map' });
  ensureValueProvided(typeof selectorMap === 'object', { prefix, noun: 'valid selector map' });
  ensureValueProvided(selectorKeys.length, { prefix, noun: 'non-empty selector map' });
  const selectors = Object.values(selectorMap);
  selectors.forEach((selector, index) =>
    ensureValidSelector(selector, {
      prefix,
      noun: `selector for the '${selectorKeys[index]}' property`,
    })
  );

  return createSelector(selectors, (...args) => {
    return selectorKeys.reduce((obj, key, index) => {
      (obj as any)[key] = args[index];
      return obj;
    }, {} as MappedResult<T>);
  }) as ModelSelector<T>;
}
