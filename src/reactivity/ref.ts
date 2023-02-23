import { trackEffect, triggerEffects, isTracking } from "./effect";
import { hasChanged } from "./shared";

class RefImpl {
  private _value: any;
  public dep;
  constructor(value) {
    this._value = value;
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 前后值发生了改变，就通知
    if (hasChanged(newValue, this._value)) {
      // 先修改 value 值，再通知
      this._value = newValue;
      triggerEffects(this.dep);
    }
  }
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffect(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}
