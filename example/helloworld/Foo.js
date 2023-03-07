import { h } from "../../lib/guide-vue_vue_vue.esm.js";
export const Foo = {
  setup(props) {
    props.count.value++;
    console.log(props, "props");
  },
  render() {
    return h("div", {}, "foo: " + this.count.value);
  },
};
