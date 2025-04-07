import { expect } from "@std/expect";
import { Mappemonde } from "../mod.ts";

Deno.test("create a Mappemonde without error", () => {
  expect(() => Mappemonde.byValue()).not.toThrow();
});

Deno.test("set and get a value", () => {
  const m = Mappemonde.byValue<[string], any>();
  m.set(["demo"], "bar");
  expect(m.get(["demo"])).toEqual("bar");
});

Deno.test("works when two keys are the same", () => {
  const m = Mappemonde.byValue<Array<number>, any>();
  m.set([43, 43], "bar");
  expect(m.get([43])).toEqual("bar");
});

Deno.test("set and get a value with two keys", () => {
  const m = Mappemonde.byValue<[string, number], any>();
  m.set(["demo", 43], "bar");
  expect(m.get(["demo", 43])).toEqual("bar");
});

Deno.test("order does not matter", () => {
  const m = Mappemonde.byValue<any, any>();
  m.set(["demo", 43], "bar");
  expect(m.get([43, "demo"])).toEqual("bar");
});

Deno.test("can use Set", () => {
  const m = Mappemonde.byValue<any, any>();
  m.set(new Set(["demo", 43]), "bar");
  expect(m.get(new Set(["demo", 43]))).toEqual("bar");
});

Deno.test("has work with undefined", () => {
  const m = Mappemonde.byValue<any, any>();
  m.set(["demo", 43], undefined);
  expect(m.get(["demo", 43])).toBe(undefined);
  expect(m.has(["demo", 43])).toBe(true);
  m.delete(["demo", 43]);
  expect(m.get(["demo", 43])).toBe(undefined);
  expect(m.has(["demo", 43])).toBe(false);
});

Deno.test("removing missing key should do nothing", () => {
  const m = Mappemonde.byValue<any, any>();
  expect(() => m.delete(["demo", 43])).not.toThrow();
});

Deno.test("keys count does matter", () => {
  const m = Mappemonde.byValue<any, any>();
  m.set(["demo", 43], "foo");
  m.set(["demo", 43, 4], "bar");
  expect(m.get([43, "demo", 4])).toEqual("bar");
  expect(m.get([43, "demo"])).toEqual("foo");
});

Deno.test("should work with refs", () => {
  const ref = {};
  const m = Mappemonde.byValue<any, any>();
  m.set([ref], "foo");
  expect(m.get([ref])).toEqual("foo");
});

Deno.test("should work with multiple refs", () => {
  const ref1 = {};
  const ref2 = {};
  const m = Mappemonde.byValue<any, any>();
  m.set([ref1, ref2], "foo");
  expect(m.get([ref2, ref1])).toEqual("foo");
});

Deno.test("can use no keys", () => {
  const m = Mappemonde.byValue<any, any>();
  m.set([], "foo");
  expect(m.get([])).toEqual("foo");
});

Deno.test("should cleanup on remove", () => {
  const m = Mappemonde.byValue<any, any>();
  m.set([43, 6], "foo");
  expect(m.get([43, 6])).toEqual("foo");
  m.delete([43, 6]);
  expect(m.get([43, 6])).toEqual(undefined);
  expect((m as any).root.children.size).toEqual(0);
});

Deno.test("should never cleanup when option is set to never", () => {
  const m = Mappemonde.byValue<any, any>({ cleanup: "never" });
  m.set([43, 6], "foo");
  expect(m.get([43, 6])).toEqual("foo");
  m.delete([43, 6]);
  expect(m.get([43, 6])).toEqual(undefined);
  expect((m as any).root.children.size).toEqual(1);
});
