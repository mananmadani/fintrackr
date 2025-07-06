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
function renderLists() {
  const data = getData();
  const incomeList = document.getElementById('income-list');
  const expenseList = document.getElementById('expense-list');
  incomeList.innerHTML = '';
  expenseList.innerHTML = '';
  data.income.forEach((item, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>₹${item.amount} | ${item.category} | ${item.date} | ${item.note || ''}</span>
      <button onclick="deleteEntry('income',${idx})">Delete</button>`;
    incomeList.appendChild(li);
  });
  data.expenses.forEach((item, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>₹${item.amount} | ${item.category} | ${item.date} | ${item.note || ''}</span>
      <button onclick="deleteEntry('expenses',${idx})">Delete</button>`;
    expenseList.appendChild(li);
  });
}
window.deleteEntry = function(type, idx) {
  const data = getData();
  data[type].splice(idx, 1);
  setData(data);
  renderLists();
  updateBalance();
  updateSummary();
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
  renderLists();
  updateBalance();
  updateSummary();
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
});
// Export as Excel
document.getElementById('export-excel-btn').addEventListener('click', function() {
  const data = getData();
  let rows = [
    ["Type", "Amount", "Category", "Date", "Note"]
  ];
  data.income.forEach(i => rows.push(["Income", i.amount, i.category, i.date, i.note || ""]));
  data.expenses.forEach(e => rows.push(["Expense", e.amount, e.category, e.date, e.note || ""]));
  let csv = rows.map(r => r.map(x => `"${x}"`).join(",")).join("\n");
  let blob = new Blob([csv], { type: "application/vnd.ms-excel" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'fintrackr-data.xls';
  a.click();
  URL.revokeObjectURL(url);
  if (window.navigator.vibrate) window.navigator.vibrate(50);
});
// Delete all data with confirmation and haptic
document.getElementById('delete-all-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
    localStorage.removeItem('fintrackr-data');
    renderLists();
    updateBalance();
    updateSummary();
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  }
});
renderLists();
updateBalance();
updateSummary();
