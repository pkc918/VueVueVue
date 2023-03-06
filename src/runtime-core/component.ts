export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
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
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  // 判断用户是否提供了render函数
  instance.render = Component.render;
}
