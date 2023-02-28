import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 22,
    });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(22);
  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 22,
    });
    let age = 22;
    const getter = jest.fn(() => {
      age++;
      return value.foo;
    });
    const cValue = computed(getter);
    expect(age).toBe(22);
    expect(getter).not.toHaveBeenCalled();
    expect(cValue.value).toBe(22);
    expect(getter).toHaveBeenCalledTimes(1);
    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);
    // should not compute until needed
    value.foo = 23;
    expect(getter).toHaveBeenCalledTimes(1);
    // now it should compute
    expect(cValue.value).toBe(23);
    expect(getter).toHaveBeenCalledTimes(2);
    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
