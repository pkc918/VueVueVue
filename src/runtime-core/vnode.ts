export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null, // this.$el 的取值
  };
  return vnode;
}
