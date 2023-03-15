import { createRenderer } from "../runtime-core";
import { isOnEventName } from "../shared";

function createElement(type) {
  return document.createElement(type);
}
function patchProp(el, key, val) {
  if (isOnEventName(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, val);
  } else {
    el.setAttribute(key, val);
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
