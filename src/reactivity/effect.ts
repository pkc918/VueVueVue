// 用来包装依赖函数的类
class ReactiveEffect {
  private _fn;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
  }
}

const targetMap = new Map();
export function track(target, key) {
  // {target: { key: [ effectFn ]}}
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

// 存出 effect 实例
let activeEffect;
export function effect(effectFn) {
  // 包装 effectFn
  const _effect = new ReactiveEffect(effectFn);
  // 第一次执行
  _effect.run();
}
