// --- TABS SETUP ---
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
function activateTab(name) {
    tabs.forEach(t => {
        if(t.dataset.tab === name) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });
    contents.forEach(c => {
        if (c.id === 'tab-' + name) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });
    if (window.navigator.vibrate) window.navigator.vibrate(22);
}
tabs.forEach(btn => {
    btn.addEventListener('click', e => {
        activateTab(e.target.dataset.tab);
        if (e.target.dataset.tab === "overview") {
            updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
        } else if (e.target.dataset.tab === "income") {
            renderIncomeList(document.getElementById('search-income')?.value || "");
        } else if (e.target.dataset.tab === "expense") {
            renderExpenseList(document.getElementById('search-expense')?.value || "");
        }
    });
});
// --- DATA FUNCTIONS ---
function getData() { return JSON.parse(localStorage.getItem('fintrackr-data') || '{"income":[],"expenses":[]}'); }
function setData(data) { localStorage.setItem('fintrackr-data', JSON.stringify(data)); }
function updateBalance() {
    const data = getData();
    const totalIncome = data.income.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    document.getElementById('balance').textContent = `₹${(totalIncome - totalExpenses).toFixed(2)}`;
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
    let all = data.income.map(e => ({...e, type: 'Income'})).concat(data.expenses.map(e => ({...e, type: 'Expense'})));
    all.sort((a, b) => b.date.localeCompare(a.date));
    const shown = all.slice(0, 5);
    const list = document.getElementById('recent-list');
    list.innerHTML = '';
    shown.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `${item.type}<br>${item.category}<br>₹${item.amount}<br>${item.date}`;
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
            li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''} 
      <button onclick="editEntry('income', ${idx})">Edit</button>
      <button onclick="deleteEntry('income', ${idx})">Delete</button>`;
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
            li.innerHTML = `₹${item.amount} | ${item.category} | ${item.date} | ${item.note||''}
      <button onclick="editEntry('expenses', ${idx})">Edit</button>
      <button onclick="deleteEntry('expenses', ${idx})">Delete</button>`;
            list.appendChild(li);
        }
    });
}
window.deleteEntry = function(type, idx) {
    const data = getData();
    data[type].splice(idx, 1);
    setData(data);
    renderIncomeList(document.getElementById('search-income')?.value || "");
    renderExpenseList(document.getElementById('search-expense')?.value || "");
    updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(100);
};
window.editEntry = function(type, idx) {
    const data = getData();
    const entry = data[type][idx];
    document.getElementById('edit-amount').value = entry.amount;
    document.getElementById('edit-category').value = entry.category;
    document.getElementById('edit-date').value = entry.date;
    document.getElementById('edit-note').value = entry.note || '';
    document.getElementById('edit-type').value = type;
    document.getElementById('edit-idx').value = idx;
    document.getElementById('edit-modal').style.display = 'flex';
};
document.getElementById('edit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = document.getElementById('edit-amount').value;
    const category = document.getElementById('edit-category').value.trim();
    const date = document.getElementById('edit-date').value;
    const note = document.getElementById('edit-note').value;
    const type = document.getElementById('edit-type').value;
    const idx = document.getElementById('edit-idx').value;
    if (!amount || !category || !date) return;
    const data = getData();
    data[type][idx] = { amount, category, date, note };
    setData(data);
    document.getElementById('edit-modal').style.display = 'none';
    renderIncomeList(document.getElementById('search-income')?.value || "");
    renderExpenseList(document.getElementById('search-expense')?.value || "");
    updateBalance(); updateSummary(); renderRecentList(); updateAutocompletes();
    if (window.navigator.vibrate) window.navigator.vibrate(22);
});
document.getElementById('close-edit-modal').addEventListener('click', function() {
    document.getElementById('edit-modal').style.display = 'none';
});
document.getElementById('edit-modal').addEventListener('click', function(e){
    if(e.target.id==='edit-modal') document.getElementById('edit-modal').style.display = 'none';
});
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
    if (window.navigator.vibrate) window.navigator.vibrate(22);
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
    if (window.navigator.vibrate) window.navigator.vibrate(22);
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
function updateAutocompletes() {
    const data = getData();
    const incList = document.getElementById('inc-category-list');
    incList.innerHTML = '';
    [...new Set(data.income.map(e => (e.category||'').trim()).filter(x=>!!x))].forEach(cat => incList.innerHTML += `<option value="${cat}">`);
    const expList = document.getElementById('exp-category-list');
    expList.innerHTML = '';
    [...new Set(data.expenses.map(e => (e.category||'').trim()).filter(x=>!!x))].forEach(cat => expList.innerHTML += `<option value="${cat}">`);
}
function filterEntriesByDate(startDate, endDate) {
    const data = getData();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let all = data.income.map(e => ({...e, type: 'Income'})).concat(data.expenses.map(e => ({...e, type: 'Expense'})));
    all = all.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
    });
    return all.sort((a, b) => b.date.localeCompare(a.date));
}
document.getElementById('generate-statement-btn').addEventListener('click', function() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    if (!startDate || !endDate) return;
    const filtered = filterEntriesByDate(startDate, endDate);
    const list = document.getElementById('statement-list');
    list.innerHTML = '';
    if(filtered.length === 0)
      list.innerHTML = '<li>No entries in this range.</li>';
    filtered.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `${item.type} | ₹${item.amount} | ${item.category} | ${item.date} | ${item.note || ''}`;
        list.appendChild(li);
    });
    if (window.navigator.vibrate) window.navigator.vibrate(22);
});
document.getElementById('export-statement-pdf-btn').addEventListener('click', function() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    if (!startDate || !endDate) return;
    const filtered = filterEntriesByDate(startDate, endDate);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('FinTrackr Statement', 10, y); y += 8;
    doc.setFontSize(12);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 10, y); y += 8;
    doc.setFontSize(10);
    filtered.forEach(item => {
        doc.text(`${item.type} | ₹${item.amount} | ${item.category} | ${item.date} | ${item.note || ''}`, 10, y);
        y += 6;
    });
    doc.save('fintrackr-statement.pdf');
    if (window.navigator.vibrate) window.navigator.vibrate(50);
});
function initialize() {
    renderIncomeList();
    renderExpenseList();
    updateBalance();
    updateSummary();
    renderRecentList();
    updateAutocompletes();
}
initialize();
