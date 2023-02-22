import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

function createActivityObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactive(raw) {
  return createActivityObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActivityObject(raw, readonlyHandlers);
}

export function isReactive(value) {
  // 设置属性，触发get函数，当不是Proxy对象时，会直接 undefined，不会触发 get，需要转换boolean
  return !!value[ReactiveFlags.IS_REACTIVE];
}
