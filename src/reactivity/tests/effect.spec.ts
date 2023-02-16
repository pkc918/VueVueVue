describe("effect", () => {
  it.skip("happy path", () => {
    // initialization
    const user = reactive({ age: 22 });
    let newAge;
    effect(() => {
      newAge = user.age + 1;
    });
    expect(newAge).toBe(11);
    // update
    user.age++;
    expect(newAge).toBe(12);
  });
});
