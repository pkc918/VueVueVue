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
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // patch
    patch(vnode);
}
function patch(vnode, container) {
    // 判断是什么类型更新
    // 处理element
    // 处理组件
    processComponent(vnode);
}
function processComponent(vnode, container) {
    // 挂载component
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    // 创建组件实例，这个实例对象会存储一些组件上的属性 如：props，slots
    const instance = createComponentInstance(vnode);
    // 处理组件
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    // 虚拟节点树
    const subTree = instance.render();
    patch(subTree);
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
            render(vnode);
        },
    };
}

// h 函数本质就是转换成vnode
function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
