import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance, children) {
  // children 具名slots object
  // instance.slots = Array.isArray(children) ? children : [children];

  // 当前具名插槽内，是单节点，还是多节点，最后统一包装成多节点的形式
  const { vnode } = instance;
  // 判断是否是 slot children
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  // 这个 slots 就是 instance 上的属性
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
