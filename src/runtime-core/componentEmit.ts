// emit("add", arg1, arg2,...);

import { camelize, toHandlerKey } from "../shared/index";

// 外部定义的方法 @add & onAdd
export function emit(instance, event, ...args) {
  const { props } = instance;
  console.log(...args);
  const handleCallback = props[toHandlerKey(camelize(event))];
  handleCallback?.(...args);
}
