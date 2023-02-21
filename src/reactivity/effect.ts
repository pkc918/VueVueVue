// 用来包装依赖函数的类
class ReactiveEffect {
  private _fn;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    // 返回 runner 执行后的值
    return this._fn();
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

export function trigger(target, key) {
  // 触发依赖函数
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

// 存出 effect 实例
let activeEffect;
export function effect(effectFn, options: any = {}) {
  // 包装 effectFn
  const _effect = new ReactiveEffect(effectFn, options.scheduler);
  // 第一次执行
  _effect.run();
  return _effect.run.bind(_effect);
}
