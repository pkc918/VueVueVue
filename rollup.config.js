import typescript from "@rollup/plugin-typescript";

// rollup 天然支持 esm
export default {
  // 入口
  input: "./src/index.ts",
  // 出口
  output: [
    // cjs 打包 commonjs
    {
      format: "cjs",
      file: "lib/guide-vue_vue_vue.cjs.js",
    },
    // esm 打包 es module
    {
      format: "es",
      file: "lib/guide-vue_vue_vue.esm.js",
    },
  ],
  plugins: [
    // ts 解析
    typescript(),
  ],
};
