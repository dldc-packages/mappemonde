export interface Mappemonde<K extends Keys<any>, V> {
  get(keys: K): V | undefined;
  set(keys: K, value: V): void;
  has(keys: K): boolean;
  delete(keys: K): void;
  entries(): Array<[K, V]>;
  values(): Array<V>;
  keys(): Array<K>;
  cleanup(): void;
}

export type MappemondeByPosition<K extends Array<any>, V> = Mappemonde<K, V>;

export const Mappemonde = {
  create: createMappemondeInternal,
  byValue: createMappemondeByValue,
  byPosition: createMappemondeByPosition,
};

type Keys<K> = Array<K> | Set<K>;

interface TreeItem<T> {
  value: { val: T } | null;
  parent: null | [any, TreeItem<T>];
  children: Map<any, TreeItem<T>>;
}

type Primitive = null | undefined | string | number | boolean | symbol;

export interface MappemondeOptions {
  cleanup?: 'never' | 'onDelete' | ['periodically', number] | ['everyDelete', number];
}

function createMappemondeByValue<K extends Keys<any>, V>(
  options: MappemondeOptions = {}
): Mappemonde<K, V> {
  return createMappemondeInternal<K, V>('value', options);
}

function createMappemondeByPosition<K extends Array<any>, V>(
  options: MappemondeOptions = {}
): MappemondeByPosition<K, V> {
  return createMappemondeInternal<K, V>('position', options);
}

function createMappemondeInternal<K extends Keys<any>, V>(
  mode: 'value' | 'position',
  options: MappemondeOptions = {}
): Mappemonde<K, V> {
  const { cleanup = 'onDelete' } = options;
  const refNums: WeakMap<any, number> = new WeakMap();

  const cleanupMode = Array.isArray(cleanup) ? cleanup[0] : cleanup;
  const cleanupNum = Array.isArray(cleanup) ? cleanup[1] : 0;

  let removeCount = 0;

  const root: TreeItem<V> = {
    parent: null,
    value: null,
    children: new Map(),
  };

  let nextRefNum = 0;

  if (cleanupMode === 'periodically') {
    setInterval(() => {
      cleanupTree();
    }, cleanupNum * 1000);
  }

  const Mappemonde: Mappemonde<K, V> = {
    get,
    set,
    has,
    delete: remove,
    entries,
    keys,
    values,
    cleanup: cleanupTree,
  };

  (Mappemonde as any).__internal = root;

  return Mappemonde;

  function refNum(ref: any): number {
    if (refNums.has(ref)) {
      return refNums.get(ref)!;
    }
    const num = nextRefNum;
    nextRefNum++;
    refNums.set(ref, num);
    return num;
  }

  function normalizeKeys(keys: K): Array<any> {
    if (mode === 'position') {
      if (keys instanceof Set) {
        throw new Error(`[Mappemonde] Set are not supported on 'position' mode`);
      }
      return keys as any;
    }
    const keysUniq = keys instanceof Set ? keys : new Set(keys);
    const keysArr = Array.from(keysUniq);
    const primitives: Array<any> = [];
    const refs: Array<any> = [];
    keysArr.forEach((item) => {
      if (isPrimitive(item)) {
        primitives.push(item);
      } else {
        refs.push(item);
      }
    });
    primitives.sort();
    refs.sort((l, r) => {
      return refNum(l) - refNum(r);
    });
    return [...primitives, ...refs];
  }

  function set(keys: K, value: V): void {
    const ks = normalizeKeys(keys);
    let current = root;
    ks.forEach((k) => {
      let next = current.children.get(k);
      if (next) {
        current = next;
      } else {
        const newItem: TreeItem<V> = {
          parent: [k, current],
          value: null,
          children: new Map(),
        };
        current.children.set(k, newItem);
        current = newItem;
      }
    });
    current.value = { val: value };
  }

  function has(keys: K): boolean {
    const ks = normalizeKeys(keys);
    let current = root;
    for (let i = 0; i < ks.length; i++) {
      const key = ks[i];
      const next = current.children.get(key);
      if (!next) {
        return false;
      }
      current = next;
    }
    return current.value !== null;
  }

  function get(keys: K): V | undefined {
    const ks = normalizeKeys(keys);
    let current = root;
    for (let i = 0; i < ks.length; i++) {
      const key = ks[i];
      const next = current.children.get(key);
      if (!next) {
        return undefined;
      }
      current = next;
    }
    return current.value === null ? undefined : current.value.val;
  }

  function remove(keys: K): void {
    const ks = normalizeKeys(keys);
    let current = root;
    for (let i = 0; i < ks.length; i++) {
      const key = ks[i];
      const next = current.children.get(key);
      if (!next) {
        return;
      }
      current = next;
    }
    if (current.value === null) {
      return;
    }
    current.value = null;
    if (cleanupMode === 'onDelete') {
      cleanupItem(current);
    }
    if (cleanupMode === 'everyDelete') {
      removeCount++;
      if (removeCount >= cleanupNum) {
        removeCount = 0;
        cleanupTree();
      }
    }
  }

  function entries(): Array<[K, V]> {
    let result: Array<[K, V]> = [];
    traverse((item, keys) => {
      if (item.value !== null) {
        result.push([keys, item.value.val]);
      }
      return true;
    });
    return result;
  }

  function keys(): Array<K> {
    return entries().map(([k]) => k);
  }

  function values(): Array<V> {
    return entries().map(([, v]) => v);
  }

  function traverse(onItem: (item: TreeItem<V>, keys: K) => boolean): void {
    const queue: Array<[Array<any>, TreeItem<V>]> = [[[], root]];
    while (queue.length > 0) {
      const next = queue.pop();
      if (!next) {
        break;
      }
      const [keys, item] = next;
      const stop = onItem(item, keys as any) === false;
      if (stop) {
        break;
      }
      if (item.children.size > 0) {
        const children: Array<[Array<any>, TreeItem<V>]> = Array.from(
          item.children.entries()
        ).map(([k, child]) => [[...keys, k], child]);
        queue.push(...children);
      }
    }
  }

  function cleanupTree() {
    // 1. find empty items
    const emptyItems: Array<TreeItem<V>> = [];
    traverse((item) => {
      if (isEmpty(item)) {
        emptyItems.push(item);
      }
      return true;
    });
    for (let i = 0; i < emptyItems.length; i++) {
      const item = emptyItems[i];
      cleanupItem(item);
    }
  }

  function cleanupItem(item: TreeItem<V>) {
    let current = item;
    while (true) {
      if (!isEmpty(current)) {
        break;
      }
      if (current.parent === null) {
        return;
      }
      const [key, parent] = current.parent;
      // the item is empty, we get it's parent and remove it !
      parent.children.delete(key);
      current = parent;
    }
  }
}

function isEmpty(item: TreeItem<any>): boolean {
  return item.value === null && item.children.size === 0;
}

function isPrimitive(val: any): val is Primitive {
  if (typeof val === 'object') {
    return val === null;
  }
  return typeof val !== 'function';
}
