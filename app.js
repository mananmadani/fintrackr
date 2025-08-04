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
// Chart.js fixed size & haptic tabs
function createPieChart(canvasId, labels, data, colorArray) {
  const canvas = document.getElementById(canvasId);
  canvas.width = 120;
  canvas.height = 120;
  if (canvas.chartInstance) canvas.chartInstance.destroy();
  let wrap = canvas.closest('.chart-wrap');
  let prevMsg = wrap.querySelector('.chart-nodata');
  if (!labels.length || data.every(v => v === 0)) {
    canvas.style.display = "none";
    if (!prevMsg) {
      let msg = document.createElement('div');
      msg.className = 'chart-nodata';
      msg.textContent = canvasId === 'income-pie' ? 'No income data' : 'No expense data';
      wrap.appendChild(msg);
    }
    return null;
  } else {
    canvas.style.display = "";
    if (prevMsg) prevMsg.remove();
  }
  const chart = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{ data: data, backgroundColor: colorArray }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
  canvas.chartInstance = chart;
  return chart;
}
function getColorArray(n) {
  const base = ['#00BFA6', '#1E88E5', '#E53935', '#FFC107', '#43A047', '#8E24AA', '#6D4C41'];
  return Array(n).fill().map((_, i) => base[i % base.length]);
}
function uniqueCategories(arr) {
  return [...new Set(arr.map(e => e.category).filter(x => !!x))];
}
function updateAutocompletes() {
  const data = getData();
  const incList = document.getElementById('inc-category-list');
  incList.innerHTML = '';
  uniqueCategories(data.income).forEach(cat => {
    incList.innerHTML += `<option value="${cat}">`;
  });
  const expList = document.getElementById('exp-category-list');
  expList.innerHTML = '';
  uniqueCategories(data.expenses).forEach(cat => {
    expList.innerHTML += `<option value="${cat}">`;
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
  renderIncomeList(document.getElementById('search-income').value.toLowerCase());
  renderExpenseList(document.getElementById('search-expense').value.toLowerCase());
  updateBalance();
  updateSummary();
  updatePieCharts();
  updateAutocompletes();
};
document.getElementById('income-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount = document.getElementById('income-amount').value;
  const category = document.getElementById('income-category').value;
  const date = document.getElementById('income-date').value;
  const note = document.getElementById('income-note').value;
  if (!amount || !category || !date) return;
  const data = getData();
  data.income.push({ amount, category, date, note });
  setData(data);
  this.reset();
  renderIncomeList();
  updateBalance();
  updateSummary();
  updatePieCharts();
  updateAutocompletes();
});
document.getElementById('expense-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const amount = document.getElementById('expense-amount').value;
  const category = document.getElementById('expense-category').value;
  const date = document.getElementById('expense-date').value;
  const note = document.getElementById('expense-note').value;
  if (!amount || !category || !date) return;
  const data = getData();
  data.expenses.push({ amount, category, date, note });
  setData(data);
  this.reset();
  renderExpenseList();
  updateBalance();
  updateSummary();
  updatePieCharts();
  updateAutocompletes();
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
  doc.setFontSize(12); doc.text('Charts:', 10, y); y += 6;
  const incomeCanvas = document.getElementById('income-pie');
  const expenseCanvas = document.getElementById('expense-pie');
  if (incomeCanvas.chartInstance && incomeCanvas.chartInstance.data.labels.length > 0) {
    doc.addImage(incomeCanvas.chartInstance.toBase64Image(), 'PNG', 10, y, 40, 40);
  }
  if (expenseCanvas.chartInstance && expenseCanvas.chartInstance.data.labels.length > 0) {
    doc.addImage(expenseCanvas.chartInstance.toBase64Image(), 'PNG', 55, y, 40, 40);
  }
  doc.save('fintrackr-report.pdf');
  if (window.navigator.vibrate) window.navigator.vibrate(50);
});
document.getElementById('delete-all-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
    localStorage.removeItem('fintrackr-data');
    renderIncomeList();
    renderExpenseList();
    updateBalance();
    updateSummary();
    updatePieCharts();
    updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  }
});
// Tabs + haptic feedback
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (window.navigator.vibrate) window.navigator.vibrate(22);
  });
});
function updatePieCharts() {
  const data = getData();
  function aggByCategory(entries) {
    const map = {};
    entries.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return map;
  }
  const incomeAgg = aggByCategory(data.income);
  const incCats = Object.keys(incomeAgg);
  const incVals = Object.values(incomeAgg);
  const expAgg = aggByCategory(data.expenses);
  const expCats = Object.keys(expAgg);
  const expVals = Object.values(expAgg);
  createPieChart('income-pie', incCats, incVals, getColorArray(incCats.length));
  createPieChart('expense-pie', expCats, expVals, getColorArray(expCats.length));
}
function initialize() {
  renderIncomeList();
  renderExpenseList();
  updateBalance();
  updateSummary();
  updatePieCharts();
  updateAutocompletes();
}
initialize();
