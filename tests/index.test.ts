import { expect, test } from "vite-plus/test";
import { Mappemonde } from "../src/index.ts";

test("Readme example should work", () => {
  const m = Mappemonde.byValue();
  m.set(["foo", 42], "bar");
  expect(m.get(["foo", 42])).toBe("bar"); // => 'bar'
});
