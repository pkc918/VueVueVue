import { h } from "../../lib/guide-vue_vue_vue.esm.js";
// import ArrayToText from "./ArrayToText.js";
// import TextToText from "./TextToText.js";
// import TextToArray from "./TextToArray.js";
import ArrayToArray from "./ArrayToArray.js";
export default {
  name: "App",
  setup() {},
  render() {
    return h("div", { tId: 1 }, [
      h("p", {}, "主页"),
      // old：text，new：text
      // h(ArrayToText),
      // old: text, new: text
      // h(TextToText),
      // old: text, new: array
      // h(TextToArray),
      // old: array, new: array
      h(ArrayToArray),
    ]);
  },
};
