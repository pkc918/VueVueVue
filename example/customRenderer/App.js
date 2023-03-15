import { h } from "../../lib/guide-vue_vue_vue.esm.js";

export const App = {
  setup() {
    return {
      x: 100,
      y: 100,
    };
  },
  render() {
    return h("rect", { x: this.x, y: this.y });
  },
};
