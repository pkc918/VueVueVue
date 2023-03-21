import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null, null);
  }

  // n1 -> oblVnode
  // n2 -> newVnode
  function patch(n1, n2, container, parentComponent, anchor) {
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
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // 这里就是判断是否为 0，位运算: | 有1就1，& 有0就0
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件 processComponent
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    // init
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
    // update
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement");
    // 对比 props，children
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    // 新的vnode里没有el，这两是同一个元素不同时期的东西（同层级）
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    const c1 = n1.children;
    const c2 = n2.children;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 当新的是text时
      // array or text -> text 时，先清空，后设置值
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children);
      }
      // 新旧 children 不相同时候更新值
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // 新的是 array
      // text -> array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array -> array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let i = 0; // 新数组中左指针
    let e1 = c1.length - 1; // 旧节点右指针
    let e2 = l2 - 1; // 新节点右指针

    function isSomeVNodeType(n1, n2) {
      // type or key
      return n1.type === n2.type && n1.key === n2.key;
    }
    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      // 判断对应位置的节点是否相同
      if (isSomeVNodeType(n1, n2)) {
        // 判断同位置相同节点类型下的属性是否变化
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 新的比老的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      let s1 = i; // 老节点的开始
      let s2 = i;
      const toBePatched = e2 - s2 + 1; // 新节点的长度
      let patched = 0;
      const keyToNewIndexMap = new Map(); // 中间部分的映射表
      // 最长递增子序列映射表
      const newIndexToOldIndexMap = new Array(toBePatched);
      let moved = false;
      let maxNewIndexSoFar = 0;
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      newIndexToOldIndexMap[i] = 0;
      // 遍历新节点，实现映射表
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        /* 
          当已经修改的节点 >= 新节点的长度，那么多余的节点肯定就是多余了，key是唯一值
        */
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        let newIndex;
        // null undefined 都可以过滤
        if (prevChild != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 遍历当前新的节点中的中间不同区域
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              // 当某个节点存在的时候，保存其位置
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          // 当前节点不存在即删除节点
          hostRemove(prevChild.el);
        } else {
          // 判断新得到的点是否大于上一个存储的节点的下标
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // 存当前存在的节点的下标
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          // 当前节点存在相同，做深层次判断是否相同
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      // 获取了最长递增自序列，当需要移动的时候才计算
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length;
      // 倒叙插入元素，保证位置正确，如果正序，后面的元素还没有排到正确的位置会导致前面的元素乱序
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        // 当前节点没有在映射表里，那就是老的没有，新的有的节点
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      // el 存储的对应的真正dom元素
      const el = children[i].el;
      // 删除el
      hostRemove(el);
    }
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

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode;
    // 相当于是把 el 挂载到 subTree 上
    const el = (vnode.el = hostCreateElement(type)); // 元素时，存储根节点
    // children -> string or array，这里只要不是对应的值，位运算后会变成0
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // vnode，挂载children在父元素上
      mountChildren(vnode.children, el, parentComponent, anchor);
    }
    // props -> object
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }
    // el.setAttribute("id", "root");
    // container.append(el);
    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      // 挂载component,n1不存在的时候就是初始化
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(
    initialVNode: any,
    container,
    parentComponent,
    anchor
  ) {
    // 创建组件实例，这个实例对象会存储一些组件上的属性 如：props，slots
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));
    // 处理组件
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(instance: any, initialVNode, container, anchor) {
    // 存储effect返回的render函数，供给组件更新的时候使用
    instance.update = effect(() => {
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
        patch(null, subTree, container, instance, anchor); // 组件全部转化为 subTree 结构的时候
        // 存储组件上的根节点
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        // next:下次要更新的节点, vnode:更新之前的节点
        const { next, vnode } = instance;
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next);
        }
        const { proxy } = instance;
        // 新treeVnode
        const subTree = instance.render.call(proxy);
        // 旧treeVnode
        const prevSubTree = instance.subTree;
        console.log("new subTree：", subTree);
        console.log("olg subTree：", prevSubTree);
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode;
  instance.next = null;
  instance.props = nextVNode.props; // 跟新组件的props
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
