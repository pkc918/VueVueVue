import {
  getCurrentInstance,
  h,
  renderSlots,
} from "../../lib/guide-vue_vue_vue.esm.js";
export const Foo = {
  name: "Foo",
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    console.log("Foo.js: ", instance);
    props.count.value++;
    console.log(props, "props");

    const emitAdd = () => {
      console.log("Foo.js：emitAdd");
      emit("add", 1, 2);
      emit("add-foo", 1, 2);
    };

    return {
      emitAdd,
    };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const foo = h("p", {}, "foo");
    console.log(this.$slots, "slots");
    const random = 21;
    // $slots 就是拿 children，渲染一个节点的时候，children 里面必须是一个虚拟节点，不可以是 数组，所以没有显示
    // return h("div", {}, [foo, btn, this.$slots]); // children: [foo, btn, [vnode, vnode]]
    // return h("div", {}, [foo, btn, renderSlots(this.$slots)]); // children: [foo, btn, div{ children: [vnode, vnode]}]
    return h("div", {}, [
      renderSlots(this.$slots, "header", { random }), // <slot name="header"></slot>
      foo,
      btn,
      renderSlots(this.$slots, "footer"), // <slot name="footer"></slot>
    ]);
  },
};
