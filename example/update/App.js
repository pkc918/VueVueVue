import { ref, h } from "../../lib/guide-vue_vue_vue.esm.js";
export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const onClick = () => {
      count.value++;
    };
    const props = ref({
      foo: "foo",
      bar: "bar",
    });
    const onChangePropsDemo1 = () => {
      console.log("xxx", props.value.foo);
      props.value.foo = "new-foo";
    };
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined;
    };
    const onChangePropsDemo3 = () => {
      props.value = {
        foo: "foo",
      };
    };
    return {
      count,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      props,
    };
  },
  render() {
    return h(
      "div",
      {
        id: "root",
        ...this.props,
      },
      [
        h("div", {}, "count: " + this.count),
        h(
          "button",
          {
            onClick: this.onClick,
          },
          "click"
        ),
        h(
          "button",
          { onClick: this.onChangePropsDemo1 },
          "changeProps - 值改变了 - 修改"
        ),
        h(
          "button",
          { onClick: this.onChangePropsDemo2 },
          "changeProps - 值变成了 undefined - 删除"
        ),
        h(
          "button",
          { onClick: this.onChangePropsDemo3 },
          "changeProps - value值变成了 {foo}"
        ),
      ]
    );
  },
};
