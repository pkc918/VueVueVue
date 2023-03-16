import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;
  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null);
  }

  // n1 -> oblVnode
  // n2 -> newVnode
  function patch(n1, n2, container, parentComponent) {
    /* 
      判断是什么类型更新 
      ShapeFlags: element or component or text_children or array_children 
  */

    // 处理element processElement
    // console.log(vnode.type);
    const { shapeFlag, type } = n2;
    // Fragment -> 只渲染 children 给slot用的，children:[Foo, Bar, [vnode, vnode]]
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // 这里就是判断是否为 0，位运算: | 有1就1，& 有0就0
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件 processComponent
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  function processElement(n1, n2, container, parentComponent) {
    // init
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
    // update
  }

  function patchElement(n1, n2, container) {
    console.log("patchElement");
    // 对比 props，children
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    // 新的vnode里没有el，这两是同一个元素不同时期的东西（同层级）
    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
  }

  // hostPatchProp: 变化当前key下的值
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 新旧props里都有属性，只是属性值有所改变
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        // 旧props里有a属性，新props里没有a属性
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = vnode;
    // 相当于是把 el 挂载到 subTree 上
    const el = (vnode.el = hostCreateElement(type)); // 元素时，存储根节点
    // children -> string or array，这里只要不是对应的值，位运算后会变成0
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // vnode，挂载children在父元素上
      mountChildren(vnode, el, parentComponent);
    }
    // props -> object
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    // el.setAttribute("id", "root");
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    // 挂载component
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVNode: any, container, parentComponent) {
    // 创建组件实例，这个实例对象会存储一些组件上的属性 如：props，slots
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 处理组件
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const { proxy } = instance;
        // 虚拟节点树，把当前代理对象绑定为this，这里就是在页面中使用 this.data，这个代理对象将一些对应的属性绑定在内部
        const subTree = (instance.subTree = instance.render.call(proxy));
        /* 
          const subTree = {
            type,
            props,
            children,
            el: null
          };
        */
        // 组件最开始是vnode变量传入，然后变成subTree变量传入
        patch(null, subTree, container, instance); // 组件全部转化为 subTree 结构的时候
        // 存储组件上的根节点
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        const { proxy } = instance;
        // 新treeVnode
        const subTree = instance.render.call(proxy);
        // 旧treeVnode
        const prevSubTree = instance.subTree;
        console.log("new subTree：", subTree);
        console.log("olg subTree：", prevSubTree);
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
