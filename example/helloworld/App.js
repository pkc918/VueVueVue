import { h } from "./guide-vue_vue_vue.esm.js";

export const App = {
  render() {
    // ui
    return h(
      "div",
      {
        id: "root",
        class: ["red", "blue"],
      },
      [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
    );
  },

  setup() {
    // composition API

    return {
      msg: "VueVueVue",
    };
  },
};
