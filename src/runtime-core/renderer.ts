import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch

  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断是什么类型更新

  // 处理element

  // 处理组件
  processComponent(vnode, container);
}

function processComponent(vnode: any, container: any) {
  // 挂载component
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container) {
  // 创建组件实例，这个实例对象会存储一些组件上的属性 如：props，slots
  const instance = createComponentInstance(vnode);
  // 处理组件
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container) {
  // 虚拟节点树
  const subTree = instance.render();
  patch(subTree, container);
}
