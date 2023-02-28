import { trackEffect, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";
import { hasChanged, isObject } from "./shared";

class RefImpl {
  private _value: any;
  public dep;
  // 存储未被处理过的 value 值，应为需要对比，如果多层对象，修改的时候，是一个对象和Proxy对象比较，所以有问题
  private _rawValue: any;
  // ref 数据标识
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    this._value = covert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 前后值发生了改变，就通知
    if (hasChanged(newValue, this._rawValue)) {
      // 当前值记录
      this._rawValue = newValue;
      // 先修改 value 值，再通知, 讲直接赋的值变为响应式
      this._value = covert(newValue);
      triggerEffects(this.dep);
    }
  }
}

function covert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffect(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  // 为基础类型时候，undefined转换为 false
  return !!ref.__v_isRef;
}
