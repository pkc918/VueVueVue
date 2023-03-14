import { getCurrentInstance } from "./component";

/* 
      必须要在setup下才能使用 
1. 所有的存取都在每个组件的实例上的provides属性

*/
export function provide(key, value) {
  // 存
  // 获取当前实例对象
  const currentInstance: any = getCurrentInstance();
  // 存入当前实例中
  if (currentInstance) {
    let { provides } = currentInstance;
    /* 
    当中间组件也设置了 provide 的时候，需要相当于把两个对象合并，
    也就是你在inject的时候，需要搜索你所有祖先节点上的提供provides属性内的值，
    这里就采用原型链的方式即可
    */
    const parentProvides = currentInstance.parent.provides;
    /* 
      下面这条语句是初始化，也就是第一次provide的时候初始化一个值
      如果同时提供了多条 provide 的时候，那么覆盖掉前面的，所以需要判断是否初始化
      当钱 provides 全等于父级的provides的时候，即是初始化
      因为在component.ts中，provides初始化的时候，只要有值，初始化为父级的provides
    */
    // Object.create(obj) 创建一个原型为obj的空对象
    if (provides === parentProvides) {
      // 初始化
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
/* 
  inject 三种用法
1. inject(key)
2. inject(key, defaultValue)
3. inject(key, () => {return defaultValue})
*/
export function inject(key, defaultValue) {
  // 取
  // 在当前实例上取值
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
