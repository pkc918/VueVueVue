// this.x 快捷操作
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  // 解构target：{ _: instance }
  get({ _: instance }, key) {
    const { setupState } = instance;
    // x in obj x属性在指定的obj对象或其原型链中，如果当前在this上获取的属性在setupState中，那就取它
    if (key in setupState) {
      return setupState[key];
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
