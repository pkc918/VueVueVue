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

触发更新，然后执行对应的依赖函数
函数里执行 render，获取到最新的虚拟节点树 vnodeTree
执行 patch，选择不同节点类型的更新函数执行
更新函数内部：对比新旧 props 的区别，以及新旧 children 的区别

对比新旧 props

1. 遍历新 props，对比旧的，进行更新：旧的有的，新的都有，但是 val 值变更了
2. 遍历旧 props，对比新的，进行更新 咧如：旧的：{a,b,c} 新的：{a,b}，这时候，只遍历新的是无法知道旧的需要删除 c

对比新旧 children

1. 判断类型，如果是 text，那就直接更新 text 就行
2. 复杂更新，整个 children 对比，数组对比数组，也就是 diff 算法的所在

diff 算法：

1. 双端对比
2. 交叉对比
3. key 对比

```Typescript
当响应式对象 count 更新了，会执行以下操作

// 首先执行 update 函数，该函数就是执行了另外一个函数 componentUpdateFn
instance.update()
// componentUpdateFn：内部执行 render，获取最新的vnodeTree，然后执行patch
function componentUpdateFn() {
    const subTree = instance.render()
    patch(null, subTree, container, null, instance)
}
// patch 作用就是根据不同类型，执行不同函数
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
// 这里面每个函数都会判断是更新还是初始化的过程，这里就拿Element举例吧
function updateElement(n1, n2, container, anchor, parentComponent) {
    // 对比 props
    patchProps(el, oldProps, newProps);

    // 对比 children
    patchChildren(n1, n2, el, anchor, parentComponent);
}
// 查找 props 的更新情况，使用 hostPatchProp 更新 props
function patchProps(el, oldProps, newProps) {
    // 对比 props 有以下几种情况
    // 1. oldProps 有，newProps 也有，但是 val 值变更了
    // 举个栗子
    // 之前: oldProps.id = 1 ，更新后：newProps.id = 2

    // key 存在 oldProps 里 也存在 newProps 内
    // 以 newProps 作为基准
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        // 对比属性
        // 需要交给 host 来更新 key
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }

    // 2. oldProps 有，而 newProps 没有了
    // 之前： {id:1,tId:2}  更新后： {id:1}
    // 这种情况下我们就应该以 oldProps 作为基准，因为在 newProps 里面是没有的 tId 的
    // 还需要注意一点，如果这个 key 在 newProps 里面已经存在了，说明已经处理过了，就不要在处理了
    for (const key in oldProps) {
      const prevProp = oldProps[key];
      const nextProp = null;
      if (!(key in newProps)) {
        // 这里是以 oldProps 为基准来遍历，
        // 而且得到的值是 newProps 内没有的
        // 所以交给 host 更新的时候，把新的值设置为 null
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
}

// 查找 children 的更新情况，也就是新旧的差异，diff算法所在
function patchChildren(n1, n2, container, anchor, parentComponent) {
    // 首先会判断，children  的类型，如果是文本修改，那直接修改文本即可
    if(text){
        hostSetElementText(container, newChildren as string);
    } else{
        // 新旧 children 都是数组，array diff array
        // 这时候就需要对比 children 啦
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
    }
}
// patchKeyedChildren: diff算法的定义
  function patchKeyedChildren(
    c1: any[],
    c2: any[],
    container,
    parentAnchor,
    parentComponent
  ) {
    /*
        1. 双端对比（首首，尾尾）
        2. 交叉对比（首尾）
        3. key对比（key）
    */
  }

```

### runtime 中初始化 component 主流程

1. render 开始，render 渲染组件到页面上，render 内部调用 patch
2. patch 判断是什么类型（组件，元素，文本）需要处理，这里只说 component
3. processComponent 做组件处理，里面使用 mountComponent 挂载组件到组件实例上
4. 内部创建一个组件实例，把一需属性存储在实例对象上（props，slots 等）
5. 执行组件的 setup，拿到对应的 setupResult，这个返回值可能是 function or object
6. 判断是否为 object，如果是，那就把 setup 挂载到实例上
7. 最后调用 finishComponentSetup，目的为了提供 render 函数，是组件内部自定义的或者是提供的

### 组件代理对象 this.$el

1. this 是一个 Proxy 代理对象，挂载在组件实例上，最后通过把这个代理对象绑定到 render 函数的 this，所以在 render 函数里面的 this.x 就是通过这个代理对象取值
2. 判断当前取值的 key，是否是 setupResult 里的属性，如果是，从里面取值，如果不是，继续判断是不是提供的像 $el $data 等这些属性，如果是，取对应值
3. 当挂载元素的时候，有一个创建根节点的逻辑，在这里将创建的 DOM 元素存储在虚拟节点上（Vnode）
4. 当挂载的是组件的时候，它会先转化为 subTree，在 subTree 里走过挂载元素的逻辑，所以在 subTree 中会有 el 属性，然后再将 subTree.el 赋值给 虚拟节点 Vnode.el

这一部分使用代理，只是为了取不同的值，不存在依赖函数
