// 1. 增加优先级调度的概念
import {
  unstable_IdlePriority as IdlePriority,
  unstable_ImmediatePriority as ImmediatePriority,
  unstable_LowPriority as LowPriority,
  unstable_NormalPriority as NormalPriority,
  unstable_UserBlockingPriority as UserBlockingPriority,
  unstable_cancelCallback as cancelCallback,
  unstable_getFirstCallbackNode as getFirstCallbackNode,
  unstable_scheduleCallback as scheduleCallback,
  unstable_shouldYield as shouldYield,
  CallbackNode,
} from "scheduler";

// 优先级数组

interface Work {
  count: number;
  priority:
    | typeof IdlePriority
    | typeof ImmediatePriority
    | typeof LowPriority
    | typeof NormalPriority
    | typeof UserBlockingPriority;
}

const work: Work = {
  count: 100,
  priority: NormalPriority,
};

// 工作队列
let workQueue: Work[] = [];

const root = document.querySelector("#root")!;

// 创建按钮
const btn = document.createElement("button");
btn.innerText = "按钮点击";
root.appendChild(btn);
btn.onclick = () => {
  workQueue.push(work);
  schedule();
};

// 调度1
// 当前正在被调度的任务回调
let curCallback: CallbackNode | null = null;
// 前一个优先级
let prevPriority: Work["priority"] = IdlePriority;

function schedule() {
  // 当前正在调度的回调
  const cbNode = getFirstCallbackNode();

  // 对任务进行优先级排序
  const curWork = workQueue.sort((a, b) => a.priority - b.priority)[0];

  if (!curWork) {
    curCallback = null;
    // 边界情况
    cbNode && cancelCallback(cbNode);
    return;
  }

  const curPriority = curWork.priority;

  // 有工作在进行，比较该工作与正在进行的工作的优先级
  // 如果优先级相同，则不需要调度新的，退出调度
  if (prevPriority === curPriority) {
    return;
  }

  // 准备调度当前最高优先级的工作
  // 调度之前，如果有工作在进行，则中断他
  cbNode && cancelCallback(cbNode);

  // 调度当前优先级最高的工作
  curCallback = scheduleCallback(curPriority, perform.bind(null, curWork));
}

// 具体的任务执行
function perform(work: Work, didTimeout?: boolean): any {
  // 是否同步执行任务,1. 任务是同步优先级 2，任务已经超时了
  const needSync = work.priority === ImmediatePriority || didTimeout;
  //
  while ((needSync || !shouldYield()) && work.count) {
    work.count--;
    // 执行组件渲染任务
    insertNum();
  }

  // 设置任务优先级
  prevPriority = work.priority;

  // 判断任务是否完成，如果完成从队列中剔除这个任务
  if (!work.count) {
    const workIndex = workQueue.indexOf(work);
    workQueue.splice(workIndex, 1);
    // 重置优先级
    prevPriority = IdlePriority;
  }

  const prevCallback = curCallback;
  schedule();
  const newCallback = curCallback;

  if (newCallback && prevCallback === newCallback) {
    // callback没变，代表是同一个work，只不过时间切片时间用尽（5ms）
    // 返回的函数会被Scheduler继续调用
    return perform.bind(null, work);
  }
}

// 更新渲染
function insertNum() {
  const ele = document.createElement("span");
  ele.innerText = `0`;
  root.appendChild(ele);
}

export {};
