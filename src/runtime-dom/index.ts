import { createRenderer } from "../runtime-core";
import { isOnEventName } from "../shared";

function createElement(type) {
  return document.createElement(type);
}
function patchProp(el, key, preVal, nextVal) {
  if (isOnEventName(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextVal);
  } else {
    // 当属性值变为 undefined 和 null 后，被清除
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}
function insert(el, parent) {
  parent.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
