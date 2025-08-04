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
function createPieChart(canvasId, labels, data, colorArray) {
  const canvas = document.getElementById(canvasId);
  // static size fix
  canvas.width = 160;
  canvas.height = 160;
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
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: "#333",
            font: { size: 15 },
            padding: 12
          }
        }
      }
    }
  });
  canvas.chartInstance = chart;
  return chart;
}
// ...rest of your app.js is unchanged (render, add, delete logic as always) ...
function getColorArray(n) {
  const base = ['#00BFA6', '#1E88E5', '#E53935', '#FFC107', '#43A047', '#8E24AA', '#6D4C41'];
  return Array(n).fill().map((_, i) => base[i % base.length]);
}
