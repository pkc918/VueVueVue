import { ref } from "../ref";

describe("ref", () => {
  it.only("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });
});
