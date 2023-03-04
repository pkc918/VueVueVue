import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // component 转换成 vnode
      const vnode = createVNode(rootComponent);
      // 所有逻辑操作，都基于 vnode 做处理
      render(vnode, rootContainer);
    },
  };
}
