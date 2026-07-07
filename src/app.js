const modules = ["总体方案", "电气一次", "电气二次", "热管理", "消防安全", "结构集成", "测试验证", "供应链"];
let tasks = [
  { name: "电力方舱总体技术路线冻结", module: "总体方案", owner: "项目经理", due: "2026-07-18", progress: 70, priority: "高" },
  { name: "10kV/0.4kV 配电拓扑与保护定值评审", module: "电气一次", owner: "电气负责人", due: "2026-07-25", progress: 45, priority: "高" },
  { name: "BMS/EMS/动环监控接口清单", module: "电气二次", owner: "控制负责人", due: "2026-08-02", progress: 30, priority: "中" },
  { name: "液冷与空调冗余方案核算", module: "热管理", owner: "热管理工程师", due: "2026-08-10", progress: 20, priority: "中" },
  { name: "样机 FAT 测试大纲", module: "测试验证", owner: "测试经理", due: "2026-08-30", progress: 10, priority: "低" }
];

const milestones = [
  { title: "需求澄清与边界条件确认", date: "2026-07-12", done: true },
  { title: "方案冻结 / 成本基线", date: "2026-07-31", done: false },
  { title: "详细设计评审", date: "2026-08-20", done: false },
  { title: "样机集成与出厂测试", date: "2026-09-30", done: false }
];

const risks = [
  { title: "数据中心负载爬坡曲线未冻结，可能影响容量配置", level: "high", action: "推动业主在方案冻结前签署输入条件。" },
  { title: "关键断路器与消防部件交期偏长", level: "medium", action: "建立 A/B 供应商替代清单并锁定样件。" },
  { title: "并机控制策略需与 EMS 联调验证", level: "medium", action: "提前搭建 HIL 或半实物联调环境。" }
];

const $ = (id) => document.getElementById(id);
const average = (items) => Math.round(items.reduce((sum, item) => sum + item.progress, 0) / Math.max(items.length, 1));

function renderMetrics() {
  const progress = average(tasks);
  const done = tasks.filter((task) => task.progress >= 100).length;
  $("overallProgress").textContent = `${progress}%`;
  $("overallBar").value = progress;
  $("taskDone").textContent = `${done}/${tasks.length}`;
  $("taskHealth").textContent = progress >= 80 ? "整体健康" : progress >= 50 ? "需关注" : "进度承压";
  $("milestoneDone").textContent = `${milestones.filter((m) => m.done).length}/${milestones.length}`;
  $("riskHigh").textContent = risks.filter((risk) => risk.level === "high").length;
}

function renderModules() {
  $("moduleChart").innerHTML = modules.map((moduleName) => {
    const moduleTasks = tasks.filter((task) => task.module === moduleName);
    const value = moduleTasks.length ? average(moduleTasks) : 0;
    return `<div class="bar-row"><b>${moduleName}</b><div class="bar"><i style="width:${value}%"></i></div><span>${value}%</span></div>`;
  }).join("");
}

function renderTasks() {
  $("taskTable").innerHTML = tasks.map((task, index) => `
    <tr>
      <td>${task.name}</td><td>${task.module}</td><td>${task.owner}</td><td>${task.due}</td>
      <td><span class="pill ${task.priority}">${task.priority}</span></td>
      <td><progress max="100" value="${task.progress}"></progress> ${task.progress}%</td>
      <td><button class="ghost" data-index="${index}">+10%</button></td>
    </tr>`).join("");
}

function renderMilestones() {
  $("milestones").innerHTML = milestones.map((item) => `<div class="mile ${item.done ? "done" : ""}"><b>${item.title}</b><br><small>${item.date} · ${item.done ? "已完成" : "未完成"}</small></div>`).join("");
}

function renderRisks() {
  $("risks").innerHTML = risks.map((risk) => `<div class="risk ${risk.level}"><b>${risk.title}</b><p>${risk.action}</p></div>`).join("");
}

function renderAll() { renderMetrics(); renderModules(); renderTasks(); renderMilestones(); renderRisks(); }

$("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  tasks.push({ name: $("taskName").value, module: $("taskModule").value, owner: $("taskOwner").value, due: $("taskDue").value, progress: Number($("taskProgress").value), priority: $("taskPriority").value });
  event.target.reset();
  renderAll();
});

$("taskTable").addEventListener("click", (event) => {
  if (!event.target.matches("button[data-index]")) return;
  const task = tasks[Number(event.target.dataset.index)];
  task.progress = Math.min(100, task.progress + 10);
  renderAll();
});

$("exportCsv").addEventListener("click", () => {
  const header = ["任务名称", "模块", "责任人", "截止日期", "优先级", "完成率"];
  const rows = tasks.map((task) => [task.name, task.module, task.owner, task.due, task.priority, task.progress]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "电力方舱项目量化数据.csv" });
  link.click();
  URL.revokeObjectURL(link.href);
});

renderAll();
