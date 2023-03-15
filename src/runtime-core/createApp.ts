import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // component 转换成 vnode
        const vnode = createVNode(rootComponent);
        // 所有逻辑操作，都基于 vnode 做处理
        render(vnode, rootContainer);
      },
    };
  };
}
