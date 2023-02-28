import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean = true;
  private _value: any;
  private _effect: any;
  constructor(getter) {
    this._getter = getter;
    // 这里执行顺序，先schedule再getter，也就是在set的时候，先打开开关，再执行getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    /* 
        当值没有改变，直接取存储的值
        一直调用get，不会重新计算，只有在set后才会重新计算值
    */
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
