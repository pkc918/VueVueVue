import { h, ref } from "../../lib/guide-vue_vue_vue.esm.js";

const prevChildren = "oldChildren";
const nextChildren = [h("div", {}, "newArrayChildren")];

export default {
  name: "ArrayToText",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
