import { createVNode } from "../vnode";

// slot 上的 props
export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      return createVNode("div", {}, slot?.(props));
    }
  }
}
