import { h } from "../../lib/guide-vue_vue_vue.esm.js";
export const Foo = {
  setup(props, { emit }) {
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
    return h("div", {}, [foo, btn]);
  },
};
