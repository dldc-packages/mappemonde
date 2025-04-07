import { expect } from "@std/expect";
import { Mappemonde } from "../mod.ts";

Deno.test("create a Mappemonde without error", () => {
  expect(() => Mappemonde.byPosition()).not.toThrow();
});

Deno.test("set and get a value", () => {
  const m = Mappemonde.byPosition<[string], any>();
  m.set(["demo"], "bar");
  expect(m.get(["demo"])).toEqual("bar");
});

Deno.test("set and get a value with two keys", () => {
  const m = Mappemonde.byPosition<[string, number], any>();
  m.set(["demo", 43], "bar");
  expect(m.get(["demo", 43])).toEqual("bar");
});

Deno.test("should throw when using Set", () => {
  const m = Mappemonde.byPosition<any, any>();
  expect(() => m.set(new Set(["demo", 43]), "bar")).toThrow();
});

Deno.test("works when two keys are the same", () => {
  const m = Mappemonde.byPosition<Array<number>, any>();
  m.set([43], "foo");
  m.set([43, 43], "bar");
  expect(m.get([43])).toEqual("foo");
  expect(m.get([43, 43])).toEqual("bar");
});

Deno.test("order does matter", () => {
  const m = Mappemonde.byPosition<any, any>();
  m.set(["demo", 43], "bar");
  m.set([43, "demo"], "foo");
  expect(m.get([43, "demo"])).toEqual("foo");
  expect(m.get(["demo", 43])).toEqual("bar");
});

Deno.test("keys count does matter", () => {
  const m = Mappemonde.byPosition<any, any>();
  m.set(["demo", 43], "foo");
  m.set(["demo", 43, 4], "bar");
  expect(m.get(["demo", 43, 4])).toEqual("bar");
  expect(m.get(["demo", 43])).toEqual("foo");
});

Deno.test("should work with refs", () => {
  const ref = {};
  const m = Mappemonde.byPosition<any, any>();
  m.set([ref], "foo");
  expect(m.get([ref])).toEqual("foo");
});

Deno.test("should work with multiple refs", () => {
  const ref1 = {};
  const ref2 = {};
  const m = Mappemonde.byPosition<any, any>();
  m.set([ref1, ref2], "foo");
  expect(m.get([ref1, ref2])).toEqual("foo");
});

Deno.test("can use no keys", () => {
  const m = Mappemonde.byPosition<any, any>();
  m.set([], "foo");
  expect(m.get([])).toEqual("foo");
});

Deno.test("should cleanup on remove", () => {
  const m = Mappemonde.byPosition<any, any>();
  m.set([43, 6], "foo");
  expect(m.get([43, 6])).toEqual("foo");
  m.delete([43, 6]);
  expect(m.get([43, 6])).toEqual(undefined);
  expect((m as any).root.children.size).toEqual(0);
});

Deno.test("should never cleanup when option is set to none", () => {
  const m = Mappemonde.byPosition<any, any>({ cleanup: "never" });
  m.set([43, 6], "foo");
  expect(m.get([43, 6])).toEqual("foo");
  m.delete([43, 6]);
  expect(m.get([43, 6])).toEqual(undefined);
  expect((m as any).root.children.size).toEqual(1);
});

Deno.test("should cleanup everyDelete when option is set", () => {
  const m = Mappemonde.byPosition<any, any>({ cleanup: ["everyDelete", 3] });
  m.set([1, 1], "a");
  m.set([2, 2], "b");
  m.set([3, 3], "c");
  m.set([4, 4], "d");
  expect(m.get([1, 1])).toEqual("a");
  m.delete([1, 1]);
  expect(m.get([1, 1])).toEqual(undefined);
  expect((m as any).root.children.size).toEqual(4);
  m.delete([2, 2]);
  expect(m.get([2, 2])).toEqual(undefined);
  expect((m as any).root.children.size).toEqual(4);
  m.delete([3, 3]);
  expect(m.get([3, 3])).toEqual(undefined);
  expect((m as any).root.children.size).toEqual(1);
});
