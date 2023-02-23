import { effect, stop } from "../effect";
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

  it("should return runner when call effect", () => {
    // effect(fn) => fn()
    let foo = 22;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(23);
    const runner_return = runner();
    expect(runner_return).toBe("foo");
  });

  it("scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    /* 
      effect 第一次执行，执行fn
      响应式对象 set update 的时候，执行 scheduler
      当执行 runner 的时候，会再次调用 fn
    */
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    // 不会被调用
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop++;
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
