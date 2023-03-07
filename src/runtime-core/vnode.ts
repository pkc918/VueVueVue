import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null, // this.$el 的取值
  };
  // children, 这里子节点可以是 组件和元素，children属性可以是数组或者字符串类型
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN; // 0001 | 0100 or 0010 | 0100
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN; // 0001 | 1000 or 0010 | 1000
  }

  return vnode;
}

// 判断是组件还是元素，然后给对应的2进制值
function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
