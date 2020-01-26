import { Multidimap } from "../src";

test("create a Multidimap without error", () => {
  expect(() => Multidimap.create()).not.toThrow();
});

test("set and get a value", () => {
  const m = Multidimap.create<[string], any>();
  m.set(["demo"], "bar");
  expect(m.get(["demo"])).toEqual("bar");
});

test("set and get a value with two keys", () => {
  const m = Multidimap.create<[string, number], any>();
  m.set(["demo", 43], "bar");
  expect(m.get(["demo", 43])).toEqual("bar");
});

test("order does not matter", () => {
  const m = Multidimap.create<any, any>();
  m.set(["demo", 43], "bar");
  expect(m.get([43, "demo"])).toEqual("bar");
});

test("keys count does matter", () => {
  const m = Multidimap.create<any, any>();
  m.set(["demo", 43], "foo");
  m.set(["demo", 43, 4], "bar");
  expect(m.get([43, "demo", 4])).toEqual("bar");
  expect(m.get([43, "demo"])).toEqual("foo");
});

test("should work with refs", () => {
  const ref = {};
  const m = Multidimap.create<any, any>();
  m.set([ref], "foo");
  expect(m.get([ref])).toEqual("foo");
});

test("should work with multiple refs", () => {
  const ref1 = {};
  const ref2 = {};
  const m = Multidimap.create<any, any>();
  m.set([ref1, ref2], "foo");
  expect(m.get([ref2, ref1])).toEqual("foo");
});
