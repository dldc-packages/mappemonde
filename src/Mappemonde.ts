export interface Mappemonde<K extends Keys<any>, V> {
  get(keys: K): V | undefined;
  set(keys: K, value: V): void;
  has(keys: K): boolean;
  delete(keys: K): void;
}

export const Mappemonde = {
  create: createMappemonde
};

type Keys<K> = Array<K> | Set<K>;

interface TreeItem<T> {
  value: { val: T } | null;
  children: Map<any, TreeItem<T>>;
}

type Primitive = null | undefined | string | number | boolean | symbol;

function isPrimitive(val: any): val is Primitive {
  if (typeof val === "object") {
    return val === null;
  }
  return typeof val !== "function";
}

function createMappemonde<K extends Keys<any>, V>(): Mappemonde<K, V> {
  const refNums: WeakMap<any, number> = new WeakMap();

  const root: TreeItem<V> = {
    value: null,
    children: new Map()
  };

  let nextRefNum = 0;

  return {
    get,
    set,
    has,
    delete: remove
    // cleanup,
    // forEach
  };

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
    const keysUniq = keys instanceof Set ? keys : new Set(keys);
    const keysArr = Array.from(keysUniq);
    const primitives: Array<any> = [];
    const refs: Array<any> = [];
    keysArr.forEach(item => {
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
    ks.forEach(k => {
      let next = current.children.get(k);
      if (next) {
        current = next;
      } else {
        const newItem: TreeItem<V> = {
          value: null,
          children: new Map()
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

  // function isEmpty(item: TreeItem<V>): boolean {
  //   return item.value === null && item.children.size === 0;
  // }

  function remove(keys: K): void {
    const ks = normalizeKeys(keys);
    let current = root;
    const parents: Array<TreeItem<V>> = [current];
    for (let i = 0; i < ks.length; i++) {
      const key = ks[i];
      const next = current.children.get(key);
      if (!next) {
        return;
      }
      parents.push(next);
      current = next;
    }
    if (current.value === null) {
      return;
    }
    current.value = null;
    // cleanup ?
    // do {
    //   if (current.value)

    // } while (parents.length > 0);
  }

  // function forEach(
  //   callbackfn: (k1: string, k2: string, value: T) => void
  // ): void {
  //   root.forEach((l1, k1) => {
  //     l1.forEach((val, k2) => {
  //       callbackfn(k1, k2, val);
  //     });
  //   });
  // }

  // function cleanup() {
  //   const cleanupQueue: Array<string> = [];
  //   root.forEach((l1, k1) => {
  //     if (l1.size === 0) {
  //       cleanupQueue.push(k1);
  //     }
  //   });
  //   cleanupQueue.forEach(k1 => {
  //     root.delete(k1);
  //   });
  // }
}
