// 用来包装依赖函数的类
class ReactiveEffect {
  private _fn;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    this._fn();
  }
}

export function effect(effectFn) {
  // 包装 effectFn
  const _effect = new ReactiveEffect(effectFn);
  // 第一次执行
  _effect.run();
}
