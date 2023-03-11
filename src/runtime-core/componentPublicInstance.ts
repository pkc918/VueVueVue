import { hasOwn } from "../shared/index";

// this.x 快捷操作
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
};

export const PublicInstanceProxyHandlers = {
  // 解构target：{ _: instance }
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    // x in obj x属性在指定的obj对象或其原型链中，如果当前在this上获取的属性在setupState中，那就取它
    // this 取值的核心，this 是这个代理对象，取值的之后触发get函数
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    /* // this.$el 返回根节点
      if (key === "$el") {
        debugger;
        return instance.vnode.el;
      } 
    */
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
