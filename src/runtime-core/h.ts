import { createVNode } from "./vnode";

// h 函数本质就是转换成vnode
export function h(type, props?, children?) {
  return createVNode(type, props, children);
}
