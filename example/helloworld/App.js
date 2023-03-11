import { Foo } from "./Foo.js";
import {
  h,
  createTextVNode,
  getCurrentInstance,
} from "../../lib/guide-vue_vue_vue.esm.js";

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
      [
        h("div", {}, "hi, " + this.msg),
        // 组件下的 children 就是 slots
        h(
          Foo,
          {
            count: { value: 1 },
            onAdd() {
              console.log("App.js：@Add");
            },
            onAddFoo() {
              console.log("App.js: @Add-Foo");
            },
          },
          // 数组 or vnode
          // h("p", {}, "slots: foo789")
          // 剧名插槽
          /* 
            <template #header>
              <p>slots: header</p>
            </template>
            <template #footer>
              <p>slots: footer</p>
            </template>
          */
          {
            header: ({ random }) => [
              h("p", {}, "slots: header " + random),
              createTextVNode("你好"),
            ],

            footer: () => h("p", {}, "slots: footer"),
          }
        ),
      ]
    );
  },

  setup() {
    // composition API
    const instance = getCurrentInstance();
    console.log("App.js: ", instance);

    return {
      msg: "VueVueVue",
    };
  },
};
