// 是对象就 return true
function isObject(value) {
  return value !== null && typeof value === "object";
}

function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };
  return component;
}
function setupComponent(instance) {
  /*
        初始化:
        1. initProps
        2. initSlots()
        3. 调用setup
    */
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
  // {vnode: {type: App，props, children}}
  // const App = {setup(){}}
  // 拿到组件
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    // function(render) or object(data)
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult) {
  // function or object
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
  const Component = instance.type;
  // 判断用户是否提供了render函数
  instance.render = Component.render;
}

function render(vnode, container) {
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
function mountElement(vnode, container) {
  const { type, props, children } = vnode;
  const el = document.createElement(type);
  // children -> string or array
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // vnode
    children.forEach((v) => {
      patch(v, el);
    });
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
function processComponent(vnode, container) {
  // 挂载component
  mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
  // 创建组件实例，这个实例对象会存储一些组件上的属性 如：props，slots
  const instance = createComponentInstance(vnode);
  // 处理组件
  setupComponent(instance);
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
  // 虚拟节点树
  const subTree = instance.render();
  patch(subTree, container);
}

function createVNode(type, props, children) {
  const vnode = {
    type,
    props,
    children,
  };
  return vnode;
}

function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // component 转换成 vnode
      const vnode = createVNode(rootComponent);
      // 所有逻辑操作，都基于 vnode 做处理
      render(vnode, rootContainer);
    },
  };
}

// h 函数本质就是转换成vnode
function h(type, props, children) {
  return createVNode(type, props, children);
}

export { createApp, h };
