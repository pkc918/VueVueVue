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

### ShapeFlags 用来判断节点类型的

```TypeScript
export const enum ShapeFlags {
  ELEMENT = 1 << 0, // 0001 元素
  STATEFUL_COMPONENT = 1 << 1, // 0010 组件
  TEXT_CHILDREN = 1 << 2, // 0100 children属性是string类型
  ARRAY_CHILDREN = 1 << 3, // 1000 children属性是数组类型
}

(ELEMENT | TEXT_CHILDREN) & TEXT_CHILDREN != 0
(ELEMENT | TEXT_CHILDREN) & ARRAY_CHILDREN === 0

(ELEMENT | ARRAY_CHILDREN) & ARRAY_CHILDREN != 0
(ELEMENT | ARRAY_CHILDREN) & TEXT_CHILDREN === 0

(STATEFUL_COMPONENT | TEXT_CHILDREN) & TEXT_CHILDREN != 0
(STATEFUL_COMPONENT | TEXT_CHILDREN) & ARRAY_CHILDREN === 0

(STATEFUL_COMPONENT | ARRAY_CHILDREN) & ARRAY_CHILDREN != 0
(STATEFUL_COMPONENT | ARRAY_CHILDREN) & TEXT_CHILDREN === 0

```

### props 功能

- props 是 setup 函数的参数
- props 有三个功能点：

  1. 在 setup 函数里能拿到 props
  2. 在 this 中能取到 props 的值
  3. props 第一层数据是只读的，不能修改

- 解决:

1. 在初始化组件中`setupComponent`中会初始化组件的 props，将 props 挂载到组件的实例上（在`setupComponent`里实现）
2. 在 this 这个代理对象中加入逻辑判断，与之前一样，判断当前 this 取的属性是否是 props 内的属性，然后返回它（在`PublicInstanceProxyHandlers`里实现）
3. 在之前封装过一个 `shallowReadonly` 函数，能满足需求，将第一层变为只读，生层次不管，所以在第一个解决那传入的 props 变为传入 shallowReadonly 处理后的 props

### slot 实现

- slot 本质就是组件的 children
- 因为有具名插槽，所以它不是数组，而是对象类型，{name: slot}
- 因为插槽有作用域插槽，所以 slot 是函数，传出来的参数相当于组件 props 类似，所以用了函数来传递 {name: (props) => slot}

当组件内传递 slot 时，组件的 children 就是 slot，所以需要把每个 children 挂载到组件实例上

```TypeScript
function normalizeObjectSlots(children: any, slots: any) {
  // 这个 slots 就是 instance 上的属性
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}
```

透过现象看本质：

```TypeScript
<slot></slot>  对应  _renderSlot(_ctx.$slots, "default"),

<Foo>
  <p>123</p>
  <p>345</p>
  <template v-slot:header></template>
</Foo>
上面这 Foo 对应：
_createVNode(_component_Foo, null, {
  header: _withCtx(() => []),
  default: _withCtx(() => [
    _createElementVNode("p", null, "123"),
    _createElementVNode("p", null, "345")
  ], undefined, true),
  _: 1 /* STABLE */
})
```

在 Vue3 中使用形式：

```vue
// MySlots.vue
<script>
const mySlots = ref < string > "试试 作用域slot demo";
</script>
<template>
  <div>
    <slot :text="mySlots"></slot>
  </div>
</template>

// app.vue
<MySlots v-slot="slotProps">
  {{ slotProps.text }}
</MySlots>
```

### getCurrentInstance API

作用：用来获取当前组件的 instance，这个 API 必须要在 setup 中使用

```TypeScript
let currentInstance = null;

export function getCurrentInstance(instance) {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}

function setupStatefulComponent(instance: any) {
  const { setup } = Component;
  if (setup) {
    setCurrentInstance(instance);
    // function(render) or object(data)
    // setup(props)  setup(props, { emit })
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    // 清空，不然子组件里也是同样的了
    setCurrentInstance(null);
  }
}

```

当组件初始化执行 setup 的时候，将 instance 值记录，因为在父组件 setup 后，子组件也有 setup 的过程，所以需要清空

### provide & inject

provide 和 inject 用法

```TypeScript
// provide
provide("foo", "fooVal");
provide("bar", "barVal");
// inject
const bar = inject("bar");
const baz = inject("baz", "bazDefault");
const baz1 = inject("baz1", () => "baz11111");
```

provide(key, value)

inject(key, defaultValue?)

provide 与 inject 核心就是一个存取，所以如何存，如何取就是我们关心的，provide 提供了 key 和 value，我们需要存储对应关系，所以在每个组件实例上都提供了一个 provides 的属性用来存
自己组件中 provide 提供的数据，在函数内获取当前组件实例，然后将用户 provide 传过来的对应关系存在 provides 属性上
又因为依赖注入是跨层级的，所以提供 provides 对象的时候，需要把当前的 provides 与父组件的 provides 产生对应关系，也就是进行原型连接
这样当取值的时候，最近一级 provides 没有取到值得时候，会顺着原型链查找，直到找到。

inject 核心就是取值，默认取值方法很简单，就是从当前组件的父组件上的 provides 开始取值，进行 key 的匹配，如果匹配到直接返回，如果没有提供对应 key，那么就返回 undefined
inject 第二种用法就是可以自己提供默认值，当祖先组件没有提供对应 provides 的数据时，有个默认值，也就是判断 key 是否在父组件的 provides 的原型上，如果不在，那就说明没有提供 provides，然后继而判断 defaultValue 是否有值，有就返回
inject 第三种就是第二种的升华，也就是在 defaultValue 有值的时候，进行类型判断，如果是函数，那就执行该函数，return 该函数执行的返回值

### 更新 props 规则

新旧 props 对比：

1. 当旧 props 有 a 属性，新 props 没有时，执行删除 a 功能
2. 当旧 props 没有 a 属性，新 props 有时，执行添加 a 功能

只要两者的某个属性不相等时，一律按照新 props 来

循环新 props，对比新旧 props 下的每个属性，不同，就按照新 props 赋值

循环旧 props，当旧 props 中某个属性不在新 props 上，那就删除
