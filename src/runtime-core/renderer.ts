import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch
  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断是什么类型更新

  // 处理element processElement
  // console.log(vnode.type);
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 处理组件 processComponent
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  // init -> update
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode;
  const el = document.createElement(type);
  // children -> string or array
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // vnode，挂载children在父元素上
    mountChildren(vnode, el);
  }
  // props -> object
  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const val = props[key];
      el.setAttribute(key, val);
    }
  }
  el.setAttribute("id", "root");
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
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
