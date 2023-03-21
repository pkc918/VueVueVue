import { ShapeFlags } from "../shared/ShapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    comopnent: null,
    key: props?.key,
    shapeFlag: getShapeFlag(type),
    el: null, // this.$el 的取值
  };
  /* 
    &：查值，有0就0，只有相同的时候返回1
    |：赋值，有1就1，相同的时候返回0 当 (a | b) & (a or b) 都为1
  */
  // children, 这里子节点可以是 组件和元素，children属性可以是数组或者字符串类型
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN; // 0001 | 0100 or 0010 | 0100
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN; // 0001 | 1000 or 0010 | 1000
  }

  // 子结点是slot：组件 + children 是 object
  // 是否是 component，不是会返回 0，不进入判断
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}

// 判断是组件还是元素，然后给对应的2进制值
function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
