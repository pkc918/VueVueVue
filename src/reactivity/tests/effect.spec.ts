import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    // initialization
    const user = reactive({ age: 22 });
    let newAge;
    // 依赖函数，在get时，收集，set时触发
    effect(() => {
      newAge = user.age + 1;
    });
    expect(newAge).toBe(23);
    // update
    user.age++;
    expect(newAge).toBe(24);
  });
});
