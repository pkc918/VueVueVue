import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}, // 初始化组件的时候，把setup的return值绑定到代理对象上
  };
  return component;
}

export function setupComponent(instance) {
  /* 
        初始化:
        1. initProps
        2. initSlots()
        3. 调用setup
    */
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  // {vnode: {type: App，props, children}}
  // const App = {setup(){}}
  // 拿到组件
  const Component = instance.type;
  // 创建一个代理对象，让它变为 this，target：{ _: instance }
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    // function(render) or object(data)
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function or object
  if (typeof setupResult === "object") {
    // 拿到 setup 的返回值，这里返回值应该是组件 this 上的值
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  // 判断用户是否提供了render函数
  instance.render = Component.render;
}
