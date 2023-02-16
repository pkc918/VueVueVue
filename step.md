### init

```
yarn init -y
创建 src 目录

yarn add typescript --dev
npx tsc --init
yarn add jest @types/jest --dev
yarn add --dev babel-jest @babel/core @babel/preset-env
yarn add --dev @babel/preset-typescript

创建 babel.config.js

ts.config.json
    "types": [
      "jest"
    ]
    "noImplicitAny": false // 允许写 any 类型

配置package.json 的 scripts
  "scripts": {
    "test": "jest"
  },
```

### reactivity

```
src 里创建 reactivity 文件夹，index.ts出口文件
reactivity 里创建 tests，防止测试文件，index.spec.ts
```
