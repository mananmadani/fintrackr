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

// --- PIE CHART LOGIC ---
let incomeChart, expenseChart;
function updatePieCharts() {
  const data = getData();
  // Aggregate by category
  function aggByCategory(entries) {
    const map = {};
    entries.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return map;
  }
  // Prepare income data
  const incomeAgg = aggByCategory(data.income);
  const incCats = Object.keys(incomeAgg);
  const incVals = Object.values(incomeAgg);
  // Prepare expense data
  const expAgg = aggByCategory(data.expenses);
  const expCats = Object.keys(expAgg);
  const expVals = Object.values(expAgg);
  // Destroy existing if needed
  if (incomeChart) incomeChart.destroy();
  if (expenseChart) expenseChart.destroy();
  // Chart for incomes
  incomeChart = new Chart(document.getElementById('income-pie'), {
    type: 'pie',
    data: {
      labels: incCats,
      datasets: [{ data: incVals, backgroundColor: getColorArray(incCats.length) }]
    },
    options: {
      plugins: { title: { display: true, text: 'Income Breakdown' }, legend: { position: 'bottom' } }
    }
  });
  // Chart for expenses
  expenseChart = new Chart(document.getElementById('expense-pie'), {
    type: 'pie',
    data: {
      labels: expCats,
      datasets: [{ data: expVals, backgroundColor: getColorArray(expCats.length) }]
    },
    options: {
      plugins: { title: { display: true, text: 'Expense Breakdown' }, legend: { position: 'bottom' } }
    }
  });
}
// -- Pie chart color helper --
function getColorArray(n) {
  const base = ['#00BFA6', '#1E88E5', '#E53935', '#FFC107', '#43A047', '#8E24AA', '#6D4C41'];
  return Array(n).fill().map((_, i) => base[i % base.length]);
}

function uniqueCategories(arr) {
  return [...new Set(arr.map(e => e.category).filter(x => !!x))];
}

// --- AUTOCOMPLETE LOGIC for datalists ---
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

// --- RENDER LISTS WITH SEARCH ---
function renderLists() {
  const data = getData();
  const searchText = (document.getElementById('search-bar').value || '').trim().toLowerCase();

  function match(item) {
    return (
      item.category.toLowerCase().includes(searchText) ||
      (item.note && item.note.toLowerCase().includes(searchText))
    );
  }

  const incomeList = document.getElementById('income-list');
  const expenseList = document.getElementById('expense-list');
  incomeList.innerHTML = '';
  expenseList.innerHTML = '';

  data.income.forEach((item, idx) => {
    if (!searchText || match(item)) {
      const li = document.createElement('li');
      li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note || ''} <button onclick="deleteEntry('income', ${idx})">Delete</button>`;
      incomeList.appendChild(li);
    }
  });
  data.expenses.forEach((item, idx) => {
    if (!searchText || match(item)) {
      const li = document.createElement('li');
      li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note || ''} <button onclick="deleteEntry('expenses', ${idx})">Delete</button>`;
      expenseList.appendChild(li);
    }
  });
}

window.deleteEntry = function(type, idx) {
  const data = getData();
  data[type].splice(idx, 1);
  setData(data);
  renderLists();
  updateBalance();
  updateSummary();
  updatePieCharts();
  updateAutocompletes();
};

// --- FORM HANDLERS ---
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
  renderLists();
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
  renderLists();
  updateBalance();
  updateSummary();
  updatePieCharts();
  updateAutocompletes();
});

// --- SEARCH BAR HANDLER ---
document.getElementById('search-bar').addEventListener('input', renderLists);

// --- PDF EXPORT WITH jsPDF ---
document.getElementById('export-pdf-btn').addEventListener('click', function() {
  const data = getData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(18);
  doc.text('FinTrackr Report', 10, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, y);
  y += 8;

  // Income Table
  doc.setFont(undefined, 'bold');
  doc.text('Incomes:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  doc.setFontSize(10);
  data.income.forEach(i => {
    doc.text(`₹${i.amount} | ${i.category} | ${i.date} | ${i.note || ''}`, 12, y);
    y += 6;
  });
  y += 6;

  // Expense Table
  doc.setFont(undefined, 'bold');
  doc.text('Expenses:', 10, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  data.expenses.forEach(e => {
    doc.text(`₹${e.amount} | ${e.category} | ${e.date} | ${e.note || ''}`, 12, y);
    y += 6;
  });
  y += 8;

  // Pie chart images
  doc.setFontSize(12);
  doc.text('Charts:', 10, y);
  y += 6;
  if (incomeChart) {
    const imgData = incomeChart.toBase64Image();
    doc.addImage(imgData, 'PNG', 10, y, 40, 40);
  }
  if (expenseChart) {
    const imgData = expenseChart.toBase64Image();
    doc.addImage(imgData, 'PNG', 55, y, 40, 40);
  }

  doc.save('fintrackr-report.pdf');
  if (window.navigator.vibrate) window.navigator.vibrate(50);
});

// --- DELETE ALL DATA ---
document.getElementById('delete-all-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
    localStorage.removeItem('fintrackr-data');
    renderLists();
    updateBalance();
    updateSummary();
    updatePieCharts();
    updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  }
});

// --- INITIALIZE ---
function initialize() {
  renderLists();
  updateBalance();
  updateSummary();
  updatePieCharts();
  updateAutocompletes();
}

initialize();
