import { Mappemonde } from "../src";

describe("Mappemonde.byValue", () => {
  test("create a Mappemonde without error", () => {
    expect(() => Mappemonde.byValue()).not.toThrow();
  });

  test("set and get a value", () => {
    const m = Mappemonde.byValue<[string], any>();
    m.set(["demo"], "bar");
    expect(m.get(["demo"])).toEqual("bar");
  });

  test("works when two keys are the same", () => {
    const m = Mappemonde.byValue<Array<number>, any>();
    m.set([43, 43], "bar");
    expect(m.get([43])).toEqual("bar");
  });

  test("set and get a value with two keys", () => {
    const m = Mappemonde.byValue<[string, number], any>();
    m.set(["demo", 43], "bar");
    expect(m.get(["demo", 43])).toEqual("bar");
  });

  test("order does not matter", () => {
    const m = Mappemonde.byValue<any, any>();
    m.set(["demo", 43], "bar");
    expect(m.get([43, "demo"])).toEqual("bar");
  });

  test("keys count does matter", () => {
    const m = Mappemonde.byValue<any, any>();
    m.set(["demo", 43], "foo");
    m.set(["demo", 43, 4], "bar");
    expect(m.get([43, "demo", 4])).toEqual("bar");
    expect(m.get([43, "demo"])).toEqual("foo");
  });

  test("should work with refs", () => {
    const ref = {};
    const m = Mappemonde.byValue<any, any>();
    m.set([ref], "foo");
    expect(m.get([ref])).toEqual("foo");
  });

  test("should work with multiple refs", () => {
    const ref1 = {};
    const ref2 = {};
    const m = Mappemonde.byValue<any, any>();
    m.set([ref1, ref2], "foo");
    expect(m.get([ref2, ref1])).toEqual("foo");
  });

  test("can use no keys", () => {
    const m = Mappemonde.byValue<any, any>();
    m.set([], "foo");
    expect(m.get([])).toEqual("foo");
  });

  test("should cleanup on remove", () => {
    const m = Mappemonde.byValue<any, any>();
    m.set([43, 6], "foo");
    expect(m.get([43, 6])).toEqual("foo");
    m.delete([43, 6]);
    expect(m.get([43, 6])).toEqual(undefined);
    expect((m as any).__internal.children.size).toEqual(0);
  });

  test("should never cleanup when option is set to none", () => {
    const m = Mappemonde.byValue<any, any>({ cleanup: "never" });
    m.set([43, 6], "foo");
    expect(m.get([43, 6])).toEqual("foo");
    m.delete([43, 6]);
    expect(m.get([43, 6])).toEqual(undefined);
    expect((m as any).__internal.children.size).toEqual(1);
  });
});

describe("Mappemonde.byPosition", () => {
  test("create a Mappemonde without error", () => {
    expect(() => Mappemonde.byPosition()).not.toThrow();
  });

  test("set and get a value", () => {
    const m = Mappemonde.byPosition<[string], any>();
    m.set(["demo"], "bar");
    expect(m.get(["demo"])).toEqual("bar");
  });

  test("set and get a value with two keys", () => {
    const m = Mappemonde.byPosition<[string, number], any>();
    m.set(["demo", 43], "bar");
    expect(m.get(["demo", 43])).toEqual("bar");
  });

  test("works when two keys are the same", () => {
    const m = Mappemonde.byPosition<Array<number>, any>();
    m.set([43], "foo");
    m.set([43, 43], "bar");
    expect(m.get([43])).toEqual("foo");
    expect(m.get([43, 43])).toEqual("bar");
  });

  test("order does matter", () => {
    const m = Mappemonde.byPosition<any, any>();
    m.set(["demo", 43], "bar");
    m.set([43, "demo"], "foo");
    expect(m.get([43, "demo"])).toEqual("foo");
    expect(m.get(["demo", 43])).toEqual("bar");
  });

  test("keys count does matter", () => {
    const m = Mappemonde.byPosition<any, any>();
    m.set(["demo", 43], "foo");
    m.set(["demo", 43, 4], "bar");
    expect(m.get(["demo", 43, 4])).toEqual("bar");
    expect(m.get(["demo", 43])).toEqual("foo");
  });

  test("should work with refs", () => {
    const ref = {};
    const m = Mappemonde.byPosition<any, any>();
    m.set([ref], "foo");
    expect(m.get([ref])).toEqual("foo");
  });

  test("should work with multiple refs", () => {
    const ref1 = {};
    const ref2 = {};
    const m = Mappemonde.byPosition<any, any>();
    m.set([ref1, ref2], "foo");
    expect(m.get([ref1, ref2])).toEqual("foo");
  });

  test("can use no keys", () => {
    const m = Mappemonde.byPosition<any, any>();
    m.set([], "foo");
    expect(m.get([])).toEqual("foo");
  });

  test("should cleanup on remove", () => {
    const m = Mappemonde.byPosition<any, any>();
    m.set([43, 6], "foo");
    expect(m.get([43, 6])).toEqual("foo");
    m.delete([43, 6]);
    expect(m.get([43, 6])).toEqual(undefined);
    expect((m as any).__internal.children.size).toEqual(0);
  });

  test("should never cleanup when option is set to none", () => {
    const m = Mappemonde.byPosition<any, any>({ cleanup: "never" });
    m.set([43, 6], "foo");
    expect(m.get([43, 6])).toEqual("foo");
    m.delete([43, 6]);
    expect(m.get([43, 6])).toEqual(undefined);
    expect((m as any).__internal.children.size).toEqual(1);
  });
});
