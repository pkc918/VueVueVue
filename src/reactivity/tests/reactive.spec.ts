import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happy patch", () => {
    const origin = { foo: 1 };
    const instance_reactive = reactive(origin);
    // 对象之间引用不相等
    expect(instance_reactive).not.toBe(origin);
    expect(instance_reactive.foo).toBe(1);
    expect(isReactive(instance_reactive)).toBe(true);
    expect(isReactive(origin)).toBe(false);
  });

  it("nested reactive", () => {
    const origin = { foo: { age: 1 }, baz: [{ age: 2 }] };
    const instance_reactive = reactive(origin);
    expect(isReactive(instance_reactive)).toBe(true);
    expect(isReactive(instance_reactive.foo)).toBe(true);
    expect(isReactive(instance_reactive.baz)).toBe(true);
    expect(isReactive(instance_reactive.baz[0])).toBe(true);
  });
});
