import { extend } from "../shared/index";

// 存出 effect 实例
let activeEffect;
// 是否收集依赖开发
let shouldTrack;
// 存储依赖容器
const targetMap = new Map();

// 用来包装依赖函数的类
export class ReactiveEffect {
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
    // 执行stop了，就直接return，此时 shouldTrack是false，不会收集依赖
    if (!this.active) {
      return this._fn();
    }

    activeEffect = this;
    // 没有 stop 收集依赖，收集完后，关闭
    shouldTrack = true;
    // 在这里会执行 track，shouldTrack为 true，收集依赖
    const result = this._fn();
    // reset
    shouldTrack = false;
    // 返回 runner 执行后的值
    return result;
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
  // 把当前依赖 effect 清掉，其他的在这里没有意义，设置0就行
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

export function isTracking() {
  // 当不让 收集依赖，或者activeEffect 没有初始化的时候，都返回 false
  return shouldTrack && activeEffect !== undefined;
}

export function track(target, key) {
  // 不让收集依赖
  if (!isTracking()) return;
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
  trackEffect(dep);
}

export function trackEffect(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  // dep 存 activeEffect, activeEffect反向存储dep
  activeEffect.deps.push(dep);
}

export function trigger(target, key) {
  // 触发依赖函数
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep) {
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
