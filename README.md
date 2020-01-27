# 🗺 Mappemonde [![Build Status](https://travis-ci.org/etienne-dldc/mappemonde.svg?branch=master)](https://travis-ci.org/etienne-dldc/mappemonde) [![](https://badgen.net/bundlephobia/minzip/mappemonde)](https://bundlephobia.com/result?p=mappemonde)

> A multidimensional (variadic keys) [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

This library expose a data structure similar to [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) except it accept an arbitrary numner of keys.

## Gist

```ts
import { Mappemonde } from "mappemonde";

const m = Mappemonde.create();
m.set(["foo", 42], "bar");
m.get(["foo", 42]); // => 'bar'
// keys order does not matter
m.get([42, "foo"]); // => 'bar'
// keys can also be a Set
m.get(new Set([42, "foo"])); // => 'bar'
```

## API

### Mappemonde.create

> Create a Mappemonde

```ts
Mappemonde.create();
```

### Methods

```ts
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
```

## Typescript

This library is written in TypeScript and expose strict types !

```ts
import { Mappemonde } from "mappemonde";

// keys should be number, value should be string
const m1 = Mappemonde.create<Array<number>, string>();

// keys should be of lenth 2 with first a string then a number
const m2 = Mappemonde.create<[string, number], string>();
```

## Cleanup

Internally this library uses a tree of `Map`. This mean that if you `set`, then `delete` an item you would end up with an empty `Map`, but `Mappemonde` prevent memory leaks by removing empty `Map` when they appear.

If this strategy doesn't work for you, you can change it using the `cleanup` option:

```ts
import { Mappemonde } from "mappemonde";

// never cleanup
const m1 = Mappemonde.create({ cleanup: "never" });
// you can call cleanup yourself
m1.cleanup();

// cleanup when you delete an item (default value)
const m2 = Mappemonde.create({ cleanup: "onDelete" });

// cleanup every 10 delete
const m3 = Mappemonde.create({ cleanup: ["everyDelete", 10] });

// cleanup every 10 seconds
const m4 = Mappemonde.create({ cleanup: ["everySeconds", 10] });
```
