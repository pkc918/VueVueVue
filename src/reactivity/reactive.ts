import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

function createActivityObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactive(raw) {
  return createActivityObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActivityObject(raw, readonlyHandlers);
}
