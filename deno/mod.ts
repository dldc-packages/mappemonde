export type Keys<K> = Array<K> | Set<K>;

export type MappemondeByPosition<K extends Array<any>, V> = Mappemonde<K, V>;

export type Primitive = null | undefined | string | number | bigint | boolean | symbol;

/**
 * Internal type for a tree item.
 */
export interface TreeItem<T> {
  value: { val: T } | null;
  parent: null | [any, TreeItem<T>];
  children: Map<any, TreeItem<T>>;
}

export type Cleanup = 'never' | 'onDelete' | ['periodically', number] | ['everyDelete', number];

export interface MappemondeOptions {
  cleanup?: Cleanup;
}

export type CleanupMode = Extract<Cleanup, string> | Extract<Cleanup, Array<any>>[0];

export class Mappemonde<K extends Keys<any>, V> {
  public static createMappemondeInternal<K extends Keys<any>, V>(
    mode: 'value' | 'position',
    options: MappemondeOptions = {}
  ): Mappemonde<K, V> {
    return new Mappemonde(mode, options);
  }

  public static byValue<K extends Keys<any>, V>(options: MappemondeOptions = {}): Mappemonde<K, V> {
    return new Mappemonde('value', options);
  }

  public static byPosition<K extends Array<any>, V>(options: MappemondeOptions = {}): MappemondeByPosition<K, V> {
    return new Mappemonde('position', options);
  }

  private readonly root: TreeItem<V> = { parent: null, value: null, children: new Map() };
  private readonly refNums: WeakMap<any, number> = new WeakMap();
  private nextRefNum = 0;
  private removeCount = 0;

  public readonly cleanupMode: CleanupMode;
  public readonly cleanupNum: number;

  constructor(public readonly mode: 'value' | 'position', options: MappemondeOptions = {}) {
    const { cleanup = 'onDelete' } = options;
    this.cleanupMode = Array.isArray(cleanup) ? cleanup[0] : cleanup;
    this.cleanupNum = Array.isArray(cleanup) ? cleanup[1] : 0;

    if (this.cleanupMode === 'periodically') {
      setInterval(() => {
        this.cleanupTree();
      }, this.cleanupNum);
    }
  }

  private normalizeKeys(keys: K): Array<any> {
    if (this.mode === 'position') {
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
      return this.refNum(l) - this.refNum(r);
    });
    return [...primitives, ...refs];
  }

  private refNum(ref: any): number {
    if (this.refNums.has(ref)) {
      return this.refNums.get(ref)!;
    }
    const num = this.nextRefNum;
    this.nextRefNum++;
    this.refNums.set(ref, num);
    return num;
  }

  private cleanupTree() {
    // 1. find empty items
    const emptyItems: Array<TreeItem<V>> = [];
    this.traverse((item) => {
      if (isEmpty(item)) {
        emptyItems.push(item);
      }
      return true;
    });
    for (let i = 0; i < emptyItems.length; i++) {
      const item = emptyItems[i];
      this.cleanupItem(item);
    }
  }

  private traverse(onItem: (item: TreeItem<V>, keys: K) => boolean): void {
    const queue: Array<[Array<any>, TreeItem<V>]> = [[[], this.root]];
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
        const children: Array<[Array<any>, TreeItem<V>]> = Array.from(item.children.entries()).map(([k, child]) => [
          [...keys, k],
          child,
        ]);
        queue.push(...children);
      }
    }
  }

  private cleanupItem(item: TreeItem<V>) {
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

  public set(keys: K, value: V): void {
    const ks = this.normalizeKeys(keys);
    let current = this.root;
    ks.forEach((k) => {
      const next = current.children.get(k);
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

  public has(keys: K): boolean {
    const ks = this.normalizeKeys(keys);
    let current = this.root;
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

  public get(keys: K): V | undefined {
    const ks = this.normalizeKeys(keys);
    let current = this.root;
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

  public delete(keys: K): void {
    const ks = this.normalizeKeys(keys);
    let current = this.root;
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
    if (this.cleanupMode === 'onDelete') {
      this.cleanupItem(current);
    }
    if (this.cleanupMode === 'everyDelete') {
      this.removeCount++;
      if (this.removeCount >= this.cleanupNum) {
        this.removeCount = 0;
        this.cleanupTree();
      }
    }
  }

  public entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    this.traverse((item, keys) => {
      if (item.value !== null) {
        result.push([keys, item.value.val]);
      }
      return true;
    });
    return result;
  }

  public keys(): Array<K> {
    return this.entries().map(([k]) => k);
  }

  public values(): Array<V> {
    return this.entries().map(([, v]) => v);
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
