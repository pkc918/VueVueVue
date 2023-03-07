import { Foo } from "./Foo.js";
import { h } from "../../lib/guide-vue_vue_vue.esm.js";

window.self = null;
export const App = {
  name: "App",
  render() {
    window.self = this;
    console.log(this.msg, "this");
    // ui
    return h(
      "div",
      {
        id: "root",
        class: ["red", "blue"],
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("mousedown");
        },
      },
      [h("div", {}, "hi, " + this.msg), h(Foo, { count: { value: 1 } })]
    );
  },

  setup() {
    // composition API

    return {
      msg: "VueVueVue",
    };
  },
};
