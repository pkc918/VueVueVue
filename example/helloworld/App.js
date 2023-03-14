import { Foo } from "./Foo.js";
import {
  h,
  createTextVNode,
  getCurrentInstance,
  provide,
  inject,
} from "../../lib/guide-vue_vue_vue.esm.js";

window.self = null;
const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooTwo");
    // provide("bar", "barVal");
    const foo = inject("foo");
    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `ProviderTwo: - ${this.foo}`),
      h(Consumer),
    ]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", "bazDefault");
    const baz1 = inject("baz1", () => "baz11111");
    return {
      foo,
      bar,
      baz,
      baz1,
    };
  },
  render() {
    return h(
      "div",
      {},
      `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.baz1}`
    );
  },
};

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
        h(Provider, {}),
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
