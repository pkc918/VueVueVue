import { isReadonly, readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // not set
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(wrapped.foo).toBe(1);
  });

  it("warn then call set", () => {
    console.warn = jest.fn();
    const readonly_obj = readonly({
      foo: 1,
    });
    readonly_obj.foo++;
    expect(console.warn).toBeCalled();
  });
});
