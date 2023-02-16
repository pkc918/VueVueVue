describe("effect", () => {
  it.skip("happy path", () => {
    // initialization
    const user = reactive({ age: 22 });
    let newAge;
    // 依赖函数，在get时，收集，set时触发
    effect(() => {
      newAge = user.age + 1;
    });
    expect(newAge).toBe(11);
    // update
    user.age++;
    expect(newAge).toBe(12);
  });
});
