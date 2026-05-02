// ================= FIREBASE =================
import { auth, db } from "./firebase-config.js";
(function(){
emailjs.init("MRF49Npx00UsDFDlF");
})();

import { onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref,
  push,
  onValue,
  update,
  remove,
  get,
  set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ================= ELEMENTS =================
const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-todo-btn");
const todoList = document.getElementById("todo-list");
const pendingBig = document.getElementById("pending-count-big");

const greetingEl = document.getElementById("greeting-text");
const dateEl = document.getElementById("today-date");
const avatarEl = document.getElementById("profile-avatar");

const prioritySelect = document.getElementById("priority-select");
const taskDesc = document.getElementById("task-desc");
const deadlineInput = document.getElementById("deadline-input");
const searchInput = document.getElementById("task-search");
const filterSelect = document.getElementById("task-filter");

// Sidebar
const sidebar = document.getElementById("sidebar");
const openSidebar = document.getElementById("open-sidebar");
const closeSidebar = document.getElementById("close-sidebar");
const sidebarName = document.getElementById("sidebar-name");
const sidebarEmail = document.getElementById("sidebar-email");
const sidebarAvatar = document.getElementById("sidebar-avatar");
const sidebarLogout = document.getElementById("sidebar-logout");

// Rewards
const streakEl = document.getElementById("streak-count");

// Settings
const emailToggle = document.getElementById("email-reminder-toggle");
const createEmailToggle = document.getElementById("create-email-reminder-toggle");
const reminderTimeInput = document.getElementById("reminder-time");
const deviceToggle = document.getElementById("device-reminder-toggle");
const editProfileBtn = document.getElementById("open-edit-profile");
const darkModeBtn = document.getElementById("dark-mode-toggle");

let taskChart = null;
let weeklyChart = null;
let currentUserId = null;
let allTasksData = {};

// ================= AUTH =================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUserId = user.uid;

  const firstLetter = (user.displayName || user.email)[0].toUpperCase();
  avatarEl.innerText = firstLetter;
  sidebarAvatar.innerText = firstLetter;
  sidebarName.innerText = user.displayName || "User";
  sidebarEmail.innerText = user.email;

  setGreeting();
  loadTodos();
  loadStreak();
  loadEmailSettings();
});

// ================= EMAIL SETTINGS =================
async function loadEmailSettings() {
  const snap = await get(ref(db, `users/${currentUserId}/settings`));
  if (!snap.exists()) return;

  const s = snap.val();

  if (emailToggle) emailToggle.checked = s.emailReminder || false;
  if (createEmailToggle) createEmailToggle.checked = s.emailReminder || false;

  if (deviceToggle) deviceToggle.checked = s.deviceReminder || false;
}

// Settings toggle save
emailToggle?.addEventListener("change", async () => {
  await update(ref(db, `users/${currentUserId}/settings`), {
    emailReminder: emailToggle.checked
  });

  if (createEmailToggle) {
    createEmailToggle.checked = emailToggle.checked;
  }
});

// Create section toggle sync
createEmailToggle?.addEventListener("change", async () => {
  await update(ref(db, `users/${currentUserId}/settings`), {
    emailReminder: createEmailToggle.checked
  });

  if (emailToggle) {
    emailToggle.checked = createEmailToggle.checked;
  }
});

// Device notifications
deviceToggle?.addEventListener("change", async () => {
  if (deviceToggle.checked) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      deviceToggle.checked = false;
      return;
    }
  }

  await update(ref(db, `users/${currentUserId}/settings`), {
    deviceReminder: deviceToggle.checked
  });
});

// ================= GREETING =================
function setGreeting() {
  const now = new Date();
  const hour = now.getHours();

  let greet = "Good Evening 🌙";
  if (hour < 12) greet = "Good Morning 🌅";
  else if (hour < 17) greet = "Good Afternoon ☀️";

  greetingEl.innerText = greet;
  dateEl.innerText = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ================= ADD TODO =================
addBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

searchInput?.addEventListener("input", loadTodos);
filterSelect?.addEventListener("change", loadTodos);

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  const day = new Date().getDay();

  push(ref(db, `todos/${currentUserId}`), {
  text,
  description: taskDesc.value,
  completed: false,
  priority: prioritySelect.value,
  createdAt: Date.now(),
  day: day,
  deadline: deadlineInput.value,
  reminderTime: reminderTimeInput.value,
  emailReminder: createEmailToggle?.checked || false
});

// EMAIL REMINDER SYSTEM

if(createEmailToggle?.checked && reminderTimeInput.value){

const reminderDate = new Date(reminderTimeInput.value).getTime();
const now = Date.now();

const delay = reminderDate - now;

console.log("Reminder delay:",delay);

if(delay > 0){

setTimeout(()=>{

emailjs.send(
"service_erb2xak",
"template_dijxose",
{
name: auth.currentUser.displayName || "User",
email:auth.currentUser.email,
task:text
}
);

console.log("Reminder email sent");

},delay);

}

}

todoInput.value="";
prioritySelect.value="medium";

// sucess animation
createBtn.classList.add("loading");

setTimeout(()=>{

createBtn.classList.remove("loading");
createBtn.classList.add("success");

showToast();

setTimeout(()=>{
createBtn.classList.remove("success");
},2000);

},1200);

}

// ================= LOAD TODOS =================
function loadTodos() {
  onValue(ref(db, `todos/${currentUserId}`), (snapshot) => {
    renderTodos(snapshot.val());
  });
}

// ================= RENDER TODOS =================
function renderTodos(data) {
  allTasksData = data || {};
  todoList.innerHTML = "";

  let total = 0;
  let completed = 0;

  if (!data) {
    pendingBig.innerText = "0";
    updateAnalytics(0, 0, 0);
    return;
  }

  const searchText = searchInput?.value?.toLowerCase() || "";
  const filterValue = filterSelect?.value || "all";
  
  Object.entries(data).forEach(([id, todo]) => {
    // SEARCH
    if (!todo.text.toLowerCase().includes(searchText)) return;

    // FILTER
    if (filterValue === "completed" && !todo.completed) return;
    if (filterValue === "pending" && todo.completed) return;
    if (filterValue === "high" && todo.priority !== "high") return;
    if (filterValue === "medium" && todo.priority !== "medium") return;
    if (filterValue === "low" && todo.priority !== "low") return;

    total++;
    if (todo.completed) completed++;

    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""} ${todo.priority}`;

    li.innerHTML = `
      <div class="todo-left">
        <input type="checkbox" ${todo.completed ? "checked" : ""}
          onchange="toggleTodo('${id}', ${todo.completed})">
        <span>
        ${escapeHtml(todo.text)}
        <br>
        <small class="deadline">${getDeadlineStatus(todo.deadline)}</small>
        </span>
        <div id="desc-${id}" class="task-desc" style="display:none;">
       ${escapeHtml(todo.description || "")}
      </div>
      </div>
      <div>
        <button onclick="toggleDesc('${id}')">📝</button>
        <button onclick="editTodo('${id}', '${escapeHtml(todo.text)}')">✏️</button>
        <button onclick="deleteTodo('${id}')">❌</button>
      </div>
    `;

    todoList.appendChild(li);
  });

  const pending = total - completed;
  pendingBig.innerText = pending;
  updateAnalytics(total, completed, pending);
  updateWeeklyStats(data);
  updateWeeklyChart(data);

  if (pending > 0 && deviceToggle?.checked) {
    sendDeviceNotification(pending);
  }
}

// ================= ACTIONS =================
window.toggleTodo = async (id, currentStatus) => {
  await update(ref(db, `todos/${currentUserId}/${id}`), {
    completed: !currentStatus
  });

  if (!currentStatus) updateStreakOnComplete();
};

window.deleteTodo = (id) => {
  remove(ref(db, `todos/${currentUserId}/${id}`));
};

window.editTodo = (id, oldText) => {
  const newText = prompt("Edit task", oldText);
  if (!newText || !newText.trim()) return;

  update(ref(db, `todos/${currentUserId}/${id}`), {
    text: newText.trim()
  });
};

// ================= STREAK =================
function getToday() {
  return new Date().toISOString().split("T")[0];
}

async function updateStreakOnComplete() {
  const rewardRef = ref(db, `users/${currentUserId}/rewards`);
  const snap = await get(rewardRef);

  const today = getToday();
  let streak = 0;
  let last = null;

  if (snap.exists()) {
    streak = snap.val().streak || 0;
    last = snap.val().lastCompletedDate || null;
  }

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().split("T")[0];

  if (last === today) return;
  if (last === yesterday) streak++;
  else streak = 1;

  await set(rewardRef, {
    streak,
    lastCompletedDate: today
  });

  renderStreak(streak);
}

async function loadStreak() {
  const snap = await get(ref(db, `users/${currentUserId}/rewards`));
  renderStreak(snap.exists() ? snap.val().streak : 0);
}

function renderStreak(streak) {
  if (!streakEl) return;
  streakEl.innerText = `${streak} Days`;
}

// ================= ANALYTICS =================
function updateAnalytics(total, completed, pending) {

  // update counters
  document.getElementById("chart-total").innerText = total;
  document.getElementById("chart-completed").innerText = completed;
  document.getElementById("chart-pending").innerText = pending;

  const ctx = document.getElementById("taskChart");
  if (!ctx) return;

  if (taskChart) taskChart.destroy();

  taskChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [{
        data: [completed, pending],
        backgroundColor: ["#22c55e", "#f97316"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } }
    }
  });
}

// ================= DARK MODE =================
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

darkModeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

// ================= SIDEBAR =================

const overlay = document.getElementById("overlay");

// OPEN SIDEBAR 🔥
openSidebar?.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.add("active");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
});

// CLOSE BUTTON
closeSidebar?.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
});

// OVERLAY CLICK CLOSE
overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
});


// ================= NAVIGATION =================
const menuItems = document.querySelectorAll(".sidebar-menu li");
const sections = document.querySelectorAll(".dash-section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {

    const target = item.getAttribute("data-target");
    if (!target) return;

    // ACTIVE CLASS
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    // SECTION SWITCH
    sections.forEach(section => section.classList.remove("active"));

    const targetSection = document.getElementById(target);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // CLOSE SIDEBAR
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";

  });
});

// ================= DEVICE NOTIFICATION =================
function sendDeviceNotification(pending) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification("MyTodoApp 🔔", {
    body: `You have ${pending} pending tasks`
  });
}

// ================= HELPER =================
function escapeHtml(text) {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// DEADLINE STATUS FUNCTION
function getDeadlineStatus(deadline){

  if(!deadline) return "";

  const today = new Date();
  const due = new Date(deadline);

  const diff = Math.ceil((due - today) / (1000*60*60*24));

  if(diff < 0){
    return "🔴 Overdue";
  }

  if(diff === 0){
    return "🟠 Due Today";
  }

  return "🟢 "+diff+" days left";

}

// notes function 
window.toggleDesc = function(id){

const el = document.getElementById("desc-"+id);

if(!el) return;

if(el.style.display === "none"){
el.style.display = "block";
}else{
el.style.display = "none";
}

}


function updateWeeklyStats(data){

if(!data) return;

let days = {
0:{total:0,completed:0},
1:{total:0,completed:0},
2:{total:0,completed:0},
3:{total:0,completed:0},
4:{total:0,completed:0},
5:{total:0,completed:0},
6:{total:0,completed:0}
};

Object.values(data).forEach(task=>{

let d = task.day ?? new Date(task.createdAt).getDay();

days[d].total++;

if(task.completed){
days[d].completed++;
}

});

const map = ["sun","mon","tue","wed","thu","fri","sat"];

for(let i=0;i<7;i++){

let pending = days[i].total - days[i].completed;

document.getElementById(map[i]+"-total").innerText = days[i].total;
document.getElementById(map[i]+"-completed").innerText = days[i].completed;
document.getElementById(map[i]+"-pending").innerText = pending;

}

}

function updateWeeklyChart(data){

if(!data) return;

let days = [0,0,0,0,0,0,0];

Object.values(data).forEach(task=>{
let d = task.day ?? new Date(task.createdAt).getDay();
days[d]++;
});

const canvas = document.getElementById("weeklyChart");
if(!canvas) return;

const ctx = canvas.getContext("2d");

if(weeklyChart) weeklyChart.destroy();


// 🔥 GRADIENT
const gradient = ctx.createLinearGradient(0,0,0,canvas.height);
gradient.addColorStop(0,"#60a5fa");
gradient.addColorStop(1,"#2563eb");


weeklyChart = new Chart(ctx,{
type:"bar",

data:{
labels:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],

datasets:[{
label:"Tasks Created",
data:days,
backgroundColor:gradient,
borderRadius:16,
borderSkipped:false,
barThickness:45,
hoverBackgroundColor:"#1d4ed8"
}]
},

options:{
responsive:true,
maintainAspectRatio:false,

layout:{
padding:{
top:20,
bottom:10
}
},

plugins:{
legend:{display:false}
},

scales:{
y:{
beginAtZero:true,
grid:{
color:"#e5e7eb"
}
},

x:{
grid:{
display:false
}
}
},

animation:{
duration:1200,
easing:"easeOutQuart"
}

}

});
}
  // email Notification Toggle
createEmailToggle?.addEventListener("change", () => {

if(createEmailToggle.checked){

reminderTimeInput.disabled = false;

}else{

reminderTimeInput.disabled = true;
reminderTimeInput.value = "";

}

});

const reminderToggle = document.getElementById("create-email-reminder-toggle");
const reminderInput = document.getElementById("reminder-time");

reminderToggle.addEventListener("change",()=>{

if(reminderToggle.checked){
reminderInput.style.display="block";
}else{
reminderInput.style.display="none";
}

});

// create task notification 

const createBtn = document.getElementById("add-todo-btn");

function showToast(){

const toast = document.getElementById("toast");

toast.classList.add("show");

setTimeout(()=>{
toast.classList.remove("show");
},3000);

}

function toggleChatbot() {
  const bot = document.getElementById("chatbot");
  const icon = document.querySelector(".chat-toggle");

  // show chatbot
  bot.classList.remove("hidden");
  setTimeout(() => bot.classList.add("active"), 10);

  // hide icon
  icon.classList.add("hidden");
}

function closeChatbot() {
  const bot = document.getElementById("chatbot");
  const icon = document.querySelector(".chat-toggle");

  bot.classList.remove("active");

  setTimeout(() => {
    bot.classList.add("hidden");
  }, 300);

  icon.classList.remove("hidden");

  // 🔥 RESET CHAT
  goBack();
}

window.toggleChatbot = toggleChatbot;
window.closeChatbot = closeChatbot;


function showTasks() {
  let html = "<h4>📋 Your Tasks:</h4>";

  const tasks = allTasksData;

  if (!tasks || Object.keys(tasks).length === 0) {
    html += "<p>No tasks found 😅</p>";
  } else {
    Object.entries(tasks).forEach(([id, task]) => {
      html += `
        <p class="chat-task" onclick="selectTask('${task.text}')">
          👉 ${task.text}
        </p>
      `;
    });
  }

  html += `<br><button onclick="goBack()">⬅ Back</button>`;

  document.getElementById("chat-body").innerHTML = html;
}

window.showTasks = showTasks;


function goBack() {
  document.getElementById("chat-body").innerHTML = `
    <p>Hi 👋 Ekansh, kya help karu?</p>

    <button onclick="showTasks()">📋 Your Tasks</button>
    <button onclick="academicHelp()">📚 Academic Help</button>
    <button onclick="generalQuery()">❓ Query</button>
  `;
}
window.goBack = goBack;

function selectTask(task) {
  document.getElementById("chat-body").innerHTML = `
    <p>🤖 Bhai maine tera task padh liya 👇</p>
    <b>${task}</b>

    <p>Kaise help karu?</p>

    <button onclick="giveSuggestion('${task}')">💡 Suggestion</button>
    <button onclick="breakTask('${task}')">📌 Break into steps</button>

    <br><br>
    <button onclick="showTasks()">⬅ Back</button>
  `;
}
window.selectTask = selectTask;

function giveSuggestion(task) {
  let suggestion = "";

  if (task.toLowerCase().includes("study")) {
    suggestion = "📚 2 hour study session + notes bana";
  } 
  else if (task.toLowerCase().includes("project")) {
    suggestion = "💻 Divide into modules + start with UI";
  } 
  else {
    suggestion = "✅ Task ko chhote steps me tod aur deadline set kar";
  }

  document.getElementById("chat-body").innerHTML += `
    <p>🤖 ${suggestion}</p>
  `;
}

window.giveSuggestion = giveSuggestion;

function breakTask(task) {
  const steps = `
    <p>📌 Step 1: Plan bana</p>
    <p>📌 Step 2: Start small</p>
    <p>📌 Step 3: Complete one part</p>
    <p>📌 Step 4: Review</p>
  `;

  document.getElementById("chat-body").innerHTML += steps;
}

window.breakTask = breakTask;

let deferredPrompt;

const installBtn = document.getElementById("install-btn");

// PWA trigger capture
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (installBtn) {
    installBtn.style.display = "block";
  }
});

// Install button click
installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    console.log("User installed app ✅");
  }

  deferredPrompt = null;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("SW Registered"))
    .catch(err => console.log(err));
}