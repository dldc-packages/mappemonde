# 🗺 Mappemonde [![Build Status](https://travis-ci.org/etienne-dldc/mappemonde.svg?branch=master)](https://travis-ci.org/etienne-dldc/mappemonde) [![](https://badgen.net/bundlephobia/minzip/mappemonde)](https://bundlephobia.com/result?p=mappemonde)

> A multidimensional (variadic keys) [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

This library expose a data structure similar to [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) except it accept an arbitrary number of keys.

## Gist

```ts
import { Mappemonde } from "mappemonde";

const m = Mappemonde.byValue();
m.set(["foo", 42], "bar");
m.get(["foo", 42]); // => 'bar'
```

## Position vs Value

Mappemonde can work in two distinc modes: **position** or **value**. This define how items are identified:

- in **value** mode the order of the keys does not matter and you can even pass a `Set` as a list of keys.
- in **position** mode, the order does matter and you can't use a `Set` because `Set` are unordered.

You need to choose the mode you want to use when you create a Mappemonde:

```ts
const positionalMap = Mappemonde.byPosition();
const valueMap = Mappemonde.byValue();
```

## API

### Creating a Mappemonde

> In both case you get back a Mappemonde instance

```ts
Mappemonde.byPosition();
// or
Mappemonde.byValue();
// or
Mappemonde.create("value");
Mappemonde.create("position");
```

### Mappemonde instance

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
const m1 = Mappemonde.byValue<Array<number>, string>();

// keys should be of lenth 2 with first a string then a number
const m2 = Mappemonde.byPosition<[string, number], string>();
```

## Cleanup

Internally this library uses a tree of `Map`. This mean that if you `set`, then `delete` an item you would end up with an empty `Map`, but `Mappemonde` prevent memory leaks by removing empty `Map` when they appear.

If this strategy doesn't work for you, you can change it using the `cleanup` option:

```ts
import { Mappemonde } from "mappemonde";

// never cleanup
const m1 = Mappemonde.byValue({ cleanup: "never" });
// you can call cleanup yourself
m1.cleanup();

// cleanup when you delete an item (default value)
const m2 = Mappemonde.byPosotion({ cleanup: "onDelete" });

// cleanup every 10 delete
const m3 = Mappemonde.create("value", { cleanup: ["everyDelete", 10] });

// cleanup every 10 seconds
const m4 = Mappemonde.create("position", {
  cleanup: ["periodically", 10 * 1000],
});
```
