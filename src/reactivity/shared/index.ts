export const extend = Object.assign;

// 是对象就 return true
export function isObject(value) {
  return value !== null && typeof value === "object";
}
