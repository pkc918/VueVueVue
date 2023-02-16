module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }], // 根据当前 node 版本作转换
    "@babel/preset-typescript", // 支持 ts
  ],
};
