export const extend = Object.assign;

// 是对象就 return true
export function isObject(value) {
  return value !== null && typeof value === "object";
}

// 没有 change 返回 true，changed 后 false
export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue);
}

// 判断是否是 onClick 这样的事件
export function isOnEventName(key: string) {
  return /^on[A-Z]/.test(key);
}

// 判断属性是否属于该对象
export function hasOwn(val, key) {
  // key 是否在 val 的原型上
  return Object.prototype.hasOwnProperty.call(val, key);
}
