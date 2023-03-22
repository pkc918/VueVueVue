const queue: any[] = [];
const p = Promise.resolve();
let isFlushPending = false;

/* 可以传回调函数 nextTick(() => {}),也可以不传, await nextTick() */
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}

export function queueMicrotasks(microTask) {
  console.log("更新就进入微任务");

  if (!queue.includes(microTask)) {
    queue.push(microTask);
  }
  queueFlush();
}

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;

  nextTick(flushTasks);
}

function flushTasks() {
  isFlushPending = false;
  let microTask;
  while ((microTask = queue.shift())) {
    microTask && microTask();
  }
}
