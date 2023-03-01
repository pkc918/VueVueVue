import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { extend, isObject } from "../shared";
// 只在初始化的时候创建一次
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    // shallow 让深层不为响应式对象
    if (shallow) {
      return res;
    }
    // 判断 res 是不是对象类型，如果是，那就深层次变响应式
    if (isObject(res)) {
      // 返回对象情况，是不是需要返回响应式对象，如果是 readonly，那就返回只读对象
      return isReadonly ? readonly(res) : reactive(res);
    }

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

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    );
    return true;
  },
};

export const shallowHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
