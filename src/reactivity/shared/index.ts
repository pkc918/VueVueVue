export const extend = Object.assign;

// 是对象就 return true
export function isObject(value) {
  return value !== null && typeof value === "object";
}

// 没有 change 返回 true，changed 后 false
export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue);
}
