// work： 代表执行的任务对象, count: 代表需要更新的组件数量
// 1. 按钮点击给任务队列新增一个任务
// 2. schedule取出这个任务，进行任务调度
// 3. insertNum遍历渲染组件
interface Work {
  count: number;
}

const work: Work = {
  count: 100,
};

// 工作队列
const workQueue: Work[] = [];

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
function schedule() {
  // 取出任务
  const work = workQueue.shift();
  // 执行任务
  work && perform(work);
}

// 调度2
function perform(work: Work) {
  while (work.count--) {
    insertNum();
  }
}

// 更新渲染
function insertNum() {
  const ele = document.createElement("span");
  ele.innerText = `0`;
  root.appendChild(ele);
}

export {};
