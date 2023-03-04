export const App = {
  render() {
    // ui
    return h("div", "hi, VueVueVue" + this.msg);
  },

  setup() {
    // composition API

    return {
      msg: "VueVueVue",
    };
  },
};
