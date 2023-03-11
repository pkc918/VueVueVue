import { createVNode, Fragment } from "../vnode";

// slot 上的 props
export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      /* 
        children 里不能有数组
        因为要把数组渲染在一起，所以借助了一个元素类型来渲染，但是这样会多出一个元素类型
        所以，在这里提供一个特殊的 type，根据这个特殊 type，只需要渲染它的children即可
      */
      return createVNode(Fragment, {}, slot(props));
    }
  }
}
