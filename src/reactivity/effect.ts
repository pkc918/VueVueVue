import { extend } from "./shared";

// 存出 effect 实例
let activeEffect;
// 存储依赖容器
const targetMap = new Map();

// 用来包装依赖函数的类
class ReactiveEffect {
  private _fn;
  public scheduler: Function | undefined;
  deps = [];
  active = true; // 限制 stop 次数
  onStop?: () => void; // stop 的回调函数
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    activeEffect = this;
    // 返回 runner 执行后的值
    return this._fn();
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

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
  if (!activeEffect) return;
  dep.add(activeEffect);
  // dep 存 activeEffect, activeEffect反向存储dep
  activeEffect.deps.push(dep);
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

export function effect(effectFn, options: any = {}) {
  // 包装 effectFn
  const _effect: any = new ReactiveEffect(effectFn, options.scheduler);
  extend(_effect, options);
  // 第一次执行
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// runner 是 effect 返回出来的
export function stop(runner) {
  runner.effect.stop();
}
