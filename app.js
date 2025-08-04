function getData() {
  return JSON.parse(localStorage.getItem('fintrackr-data') || '{"income":[],"expenses":[]}');
}
function setData(data) {
  localStorage.setItem('fintrackr-data', JSON.stringify(data));
}
function updateBalance() {
  const data = getData();
  const totalIncome = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  document.getElementById('balance').textContent = (totalIncome - totalExpenses).toFixed(2);
}
function updateSummary() {
  const data = getData();
  const totalCashIn = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalCashOut = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  document.getElementById('total-cashin').textContent = `₹${totalCashIn.toFixed(2)}`;
  document.getElementById('total-cashout').textContent = `₹${totalCashOut.toFixed(2)}`;
}
function renderRecentList() {
  const data = getData();
  let all = data.income.map(e => ({...e, type: 'Income'})).concat(
    data.expenses.map(e => ({...e, type: 'Expense'}))
  );
  all.sort((a,b) => b.date.localeCompare(a.date));
  const shown = all.slice(0,5);
  const list = document.getElementById('recent-list');
  list.innerHTML = '';
  shown.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="entry-type-${item.type.toLowerCase()}">${item.type}</span>
      <span class="entry-category">${item.category}</span>
      <span>₹${item.amount}</span>
      <span style="font-size:0.99em;color:#b3bbc6;margin-left:7px;">${item.date}</span>`;
    list.appendChild(li);
  });
}
function renderIncomeList(filter="") {
  const data = getData();
  const list = document.getElementById('income-list');
  list.innerHTML = '';
  data.income.forEach((item, idx) => {
    if (!filter || item.category.toLowerCase().includes(filter) || (item.note && item.note.toLowerCase().includes(filter))) {
      const li = document.createElement('li');
      li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''} <button onclick="deleteEntry('income',${idx})">Delete</button>`;
      list.appendChild(li);
    }
  });
}
function renderExpenseList(filter="") {
  const data = getData();
  const list = document.getElementById('expense-list');
  list.innerHTML = '';
  data.expenses.forEach((item, idx) => {
    if (!filter || item.category.toLowerCase().includes(filter) || (item.note && item.note.toLowerCase().includes(filter))) {
      const li = document.createElement('li');
      li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''} <button onclick="deleteEntry('expenses',${idx})">Delete</button>`;
      list.appendChild(li);
    }
  });
}
window.deleteEntry = function(type, idx) {
  const data = getData();
  data[type].splice(idx, 1);
  setData(data);
  renderIncomeList(document.getElementById('search-income')?.value?.toLowerCase() || "");
  renderExpenseList(document.getElementById('search-expense')?.value?.toLowerCase() || "");
  updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
};
// Income/Expense add/search remain unchanged...
document.getElementById('income-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount = document.getElementById('income-amount').value;
  const category = document.getElementById('income-category').value.trim();
  const date = document.getElementById('income-date').value;
  const note = document.getElementById('income-note').value;
  if (!amount || !category || !date) return;
  const data = getData();
  data.income.push({ amount, category, date, note });
  setData(data);
  this.reset();
  renderIncomeList(); updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
});
document.getElementById('expense-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount = document.getElementById('expense-amount').value;
  const category = document.getElementById('expense-category').value.trim();
  const date = document.getElementById('expense-date').value;
  const note = document.getElementById('expense-note').value;
  if (!amount || !category || !date) return;
  const data = getData();
  data.expenses.push({ amount, category, date, note });
  setData(data);
  this.reset();
  renderExpenseList(); updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
});
document.getElementById('search-income').addEventListener('input', function() {
  renderIncomeList(this.value.toLowerCase());
});
document.getElementById('search-expense').addEventListener('input', function() {
  renderExpenseList(this.value.toLowerCase());
});
document.getElementById('export-pdf-btn').addEventListener('click', function() {
  const data = getData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(18);
  doc.text('FinTrackr Report', 10, y); y += 8;
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, y); y += 8;
  doc.setFont(undefined, 'bold'); doc.text('Income:', 10, y); doc.setFont(undefined, 'normal'); y += 6;
  doc.setFontSize(10); data.income.forEach(i => { doc.text(`₹${i.amount} | ${i.category} | ${i.date} | ${i.note||''}`, 12, y); y += 6; }); y += 6;
  doc.setFont(undefined, 'bold'); doc.text('Expense:', 10, y); doc.setFont(undefined, 'normal'); y += 6;
  data.expenses.forEach(e => { doc.text(`₹${e.amount} | ${e.category} | ${e.date} | ${e.note||''}`, 12, y); y += 6; }); y += 8;
  doc.save('fintrackr-report.pdf');
  if (window.navigator.vibrate) window.navigator.vibrate(50);
});
document.getElementById('delete-all-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
    localStorage.removeItem('fintrackr-data');
    renderIncomeList(); renderExpenseList();
    updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  }
});
// --- Tab switching + haptic feedback ---
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
function activateTab(name) {
  tabs.forEach(t => {
    if(t.dataset.tab === name) {
      t.classList.add('active');
      if (window.navigator.vibrate) window.navigator.vibrate(22);
    } else {
      t.classList.remove('active');
    }
  });
  contents.forEach(c => {
    if(c.id === 'tab-' + name) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });
}
tabs.forEach(btn => {
  btn.addEventListener('click', e => {
    activateTab(e.target.dataset.tab);
    // After switching, re-render relevant tab: always update everything for safety
    updateBalance(); updateSummary(); renderRecentList(); renderIncomeList(); renderExpenseList();
  });
});
// --- End: Tabs/haptic
function updateAutocompletes() {
  const data = getData();
  const incList = document.getElementById('inc-category-list');
  incList.innerHTML = '';
  [...new Set(data.income.map(e => (e.category||'').trim()).filter(x=>!!x))].forEach(cat => incList.innerHTML += `<option value="${cat}">`);
  const expList = document.getElementById('exp-category-list');
  expList.innerHTML = '';
  [...new Set(data.expenses.map(e => (e.category||'').trim()).filter(x=>!!x))].forEach(cat => expList.innerHTML += `<option value="${cat}">`);
}
function initialize() {
  renderIncomeList();
  renderExpenseList();
  updateBalance();
  updateSummary();
  renderRecentList();
  updateAutocompletes();
}
initialize();
