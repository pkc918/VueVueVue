### vue 各个模块

编译时：

- @vue/compiler-sfc 专门用来解析`.vue`文件的
- @vue/compiler-dom 处理 `.vue` 里的 `template`，将其编译成`render`函数
- @vue/compiler-core `compiler` 核心

运行时：

- @vue/runtime-dom 专门处理`dom`节点的
- @vue/runtime-core 核心运行时
- @vue/reactivity 响应式

各个模块都可以单独拿出来使用。

### reactivity 响应式流程

```TypeScript
const obj = {}
reactivity(obj) // 暴露出的响应API
// target: 目标对象，proxyMap，存储proxy的地方，baseHandlers：拦截get，set函数
createReactiveObject(target, proxyMap, baseHandlers) // 内部执行这个函数，创建一个 Proxy 对象并返回，
const baseHandlers = {
    // receiver: 如果target对象中指定了getter，receiver则为getter调用时的this值。
    get: (target, key, receiver) => {
        const res = Reflect.get(target, key, receiver)
        // 收集依赖
        track(target, "get", key)
        return res;
    },
    // receiver: 如果遇到 setter，receiver则为setter调用时的this值。
    set: (target, key, value, receiver) => {
        const result: boolean = Reflect.set(target, key, value, receiver)
        // 触发依赖
        trigger(target, "set", key)
        return result;
    }
}

// track 收集依赖
function track(target, type, key){
    // 找到对应的 dep，如果没有就是初始化 dep
    let dep = depsMal.get(key)
    if(!dep){
        dep = createDep()
        depsMap.set(key, dep)
    }
    // 用 dep 存放所有的 effect
    trackEffects(dep) // 收集所有依赖
}

// trigger 触发依赖
function trigger(target, type, key){
    // 取出依赖收集到数组并执行
    const dep = depsMap.get(key)
    deps.push(dep)

    deps.forEach((dep) => {
        // 收集到 effects
        effects.push(...dep)
    })
    // 一个 dep 包含所有 effect
    triggerEffects(createDep(effects)) // 执行收集到的所有 effect
}

function triggerEffects(dep){
    // 循环 dep，然后 run
    for(const effect of dep){
        effect.run() // 执行当前用户传进来的 fn，effect(() => (dummy = counter.num))，当 counter.num 值更新时，执行这个函数，dummy 发生更新
    }
}
```

### runtime-core 初始化流程

```TypeScript
// 入口
const root = document.querySelector("#root")
createApp(App).mount(root)

function createApp(rootComponent){
    const app = {
        _component: rootComponent,
        mount(rootContainer){
            // 创建虚拟节点
            const vnode = createVNode(rootComponent)
            // 将这个组件渲染到根容器上
            render(vnode, rootContainer)
        }
    }
    return app
}

// render函数，就是为了调用 patch
const render = (vnode, container) => {
    console.log("调用 patch")
    patch(null, vnode, container);
};
// patch 根据vnode不同类型（组件，元素，文本），调用不同的生成函数
function patch(n1, n2, container = null, anchor = null, parentComponent = null){
    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      // 其中还有几个类型比如： static fragment comment
      case Fragment:
        // processFragment(n1, n2, container);
        break;
      default:
        // 这里就基于 shapeFlag 来处理
        if (shapeFlag & ShapeFlags.ELEMENT) {
          console.log("处理 element");
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          console.log("处理 component");
          processComponent(n1, n2, container, parentComponent);
        }
    }
}

// 如果是组件，processComponent执行
// 把组件内的元素和文本解析出来成vnode
function processComponent(n1, n2, container, parentComponent) {
    // 初始化组件
    initProps(instance, props);
    // 处理 slots
    initSlots(instance, children);
    // 再次调用 patch，基于 render 返回 vnode，再次渲染，递归开箱
    patch(null, subTree, container, null, instance)
    // 把 root element 赋值给组件 el，为后续调用 $el 的时候获取值
}

// 如果是元素，processElement执行
// 创建元素，对children进行递归渲染
function processElement(vnode, container, anchor) {
    const el = document.createElement(vnode.type) // 创建元素

    // 将vnode.children里的元素或者文本或组件放入 el 容器内
    mountChildren(vnode.children, el)
}

// 将 所有children放入 container内
function mountChildren(children, container) {
children.forEach((VNodeChild) => {
    // todo
    // 这里应该需要处理一下 vnodeChild
    // 因为有可能不是 vnode 类型
    console.log("mountChildren:", VNodeChild);
    patch(null, VNodeChild, container);
});
}

// 如果是文本，processText执行
// 生成 文本 insert 到 el 内
function processText(n1, n2, container) {
    container.insertBefore(document.createTextNode(text))
}

```

### runtime-core 更新流程
