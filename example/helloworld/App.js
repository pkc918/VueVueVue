import { h } from "./guide-vue_vue_vue.esm.js";

window.self = null;
export const App = {
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
      "hi " + this.msg
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
    );
  },

  setup() {
    // composition API

    return {
      msg: "VueVueVue",
    };
  },
};
