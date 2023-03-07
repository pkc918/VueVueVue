import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch
  patch(vnode, container);
}

function patch(vnode, container) {
  /* 
      判断是什么类型更新 
      ShapeFlags: element or component or text_children or array_children 
  */

  // 处理element processElement
  // console.log(vnode.type);
  const { shapeFlag } = vnode;
  // 这里就是判断是否为 0，位运算: | 有1就1，& 有0就0
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 处理组件 processComponent
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  // init -> update
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const { type, props, children, shapeFlag } = vnode;
  // 相当于是把 el 挂载到 subTree 上
  const el = (vnode.el = document.createElement(type)); // 元素时，存储根节点
  // children -> string or array，这里只要不是对应的值，位运算后会变成0
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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

function mountComponent(initialVNode: any, container) {
  // 创建组件实例，这个实例对象会存储一些组件上的属性 如：props，slots
  const instance = createComponentInstance(initialVNode);
  // 处理组件
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container) {
  const { proxy } = instance;
  // 虚拟节点树，把当前代理对象绑定为this，这里就是在页面中使用 this.data，这个代理对象将一些对应的属性绑定在内部
  const subTree = instance.render.call(proxy);
  /* 
    const subTree = {
      type,
      props,
      children,
      el: null
    };
  */
  // 组件最开始是vnode变量传入，然后变成subTree变量传入
  patch(subTree, container); // 组件全部转化为 subTree 结构的时候
  // 存储组件上的根节点
  initialVNode.el = subTree.el;
}
