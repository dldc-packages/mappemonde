import { expect } from "@std/expect";
import { Mappemonde } from "../mod.ts";

Deno.test("Readme example should work", () => {
  const m = Mappemonde.byValue();
  m.set(["foo", 42], "bar");
  expect(m.get(["foo", 42])).toBe("bar"); // => 'bar'
});
