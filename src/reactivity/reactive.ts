import { track, trigger } from "./effect";

function createGetter(isReadonly: boolean = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res: boolean = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}

export function reactive(raw) {
  return new Proxy(raw, {
    get: createGetter(),
    set: createSetter(),
  });
}

export function readonly(raw) {
  return new Proxy(raw, {
    get: createGetter(true),
    set(target, key, value) {
      return true;
    },
  });
}
