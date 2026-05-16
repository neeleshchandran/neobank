// ===== DATA =====
const USERS = {
  user1: {
    pin: '1111',
    name: 'Alex Johnson',
    balance: 12450.00,
    cardNumber: '4532 1234 5678 9012',
    transactions: [
      { id: 1, type: 'credit', desc: 'Monthly Salary', amount: 5000.00, date: '2026-05-01' },
      { id: 2, type: 'debit',  desc: 'Netflix Subscription', amount: 15.99, date: '2026-05-02' },
      { id: 3, type: 'debit',  desc: 'Grocery Store', amount: 87.50, date: '2026-05-05' },
      { id: 4, type: 'credit', desc: 'Freelance Payment', amount: 1200.00, date: '2026-05-08' },
      { id: 5, type: 'debit',  desc: 'Electricity Bill', amount: 110.00, date: '2026-05-10' },
      { id: 6, type: 'debit',  desc: 'Restaurant Dinner', amount: 65.00, date: '2026-05-12' },
    ]
  },
  user2: {
    pin: '2222',
    name: 'Sara Williams',
    balance: 7820.50,
    cardNumber: '5412 7654 3210 8765',
    transactions: [
      { id: 1, type: 'credit', desc: 'Salary Deposit', amount: 3800.00, date: '2026-05-01' },
      { id: 2, type: 'debit',  desc: 'Rent Payment', amount: 1200.00, date: '2026-05-03' },
      { id: 3, type: 'credit', desc: 'Investment Return', amount: 450.00, date: '2026-05-06' },
      { id: 4, type: 'debit',  desc: 'Phone Bill', amount: 55.00, date: '2026-05-09' },
      { id: 5, type: 'debit',  desc: 'Online Shopping', amount: 230.00, date: '2026-05-11' },
    ]
  }
};

let currentUser = null;
let cardRevealed = false;

// ===== AUTH =====
function login() {
  const username = document.getElementById('login-user').value.trim();
  const pin = document.getElementById('login-pin').value.trim();
  const err = document.getElementById('login-error');

  if (USERS[username] && USERS[username].pin === pin) {
    currentUser = username;
    err.classList.add('hidden');
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    initApp();
  } else {
    err.classList.remove('hidden');
    document.getElementById('login-pin').value = '';
  }
}

function logout() {
  currentUser = null;
  cardRevealed = false;
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pin').value = '';
}

// Login on Enter key
document.getElementById('login-pin').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});
document.getElementById('login-user').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

// ===== INIT =====
function initApp() {
  const user = USERS[currentUser];

  // Greeting
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = `${greet}, ${user.name.split(' ')[0]}!`;

  // Date
  document.getElementById('header-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Sidebar
  document.getElementById('sidebar-name').textContent = user.name.split(' ')[0];
  document.getElementById('sidebar-avatar').textContent = user.name[0];

  // Card
  document.getElementById('vc-name').textContent = user.name.toUpperCase();
  document.getElementById('vc-number').textContent = '**** **** **** ' + user.cardNumber.slice(-4);
  cardRevealed = false;

  // Transfer from
  document.getElementById('transfer-from-account').textContent =
    `${user.name} — **** ${user.cardNumber.slice(-4)}`;

  updateDashboard();
  renderTransactions();
  showTab('dashboard', document.querySelector('.nav-item'));
}

// ===== DASHBOARD =====
function updateDashboard() {
  const user = USERS[currentUser];
  document.getElementById('total-balance').textContent = formatMoney(user.balance);

  const income = user.transactions
    .filter(t => t.type === 'credit')
    .reduce((s, t) => s + t.amount, 0);
  const expense = user.transactions
    .filter(t => t.type === 'debit')
    .reduce((s, t) => s + t.amount, 0);

  document.getElementById('total-income').textContent = formatMoney(income);
  document.getElementById('total-expense').textContent = formatMoney(expense);

  // Recent (last 4)
  const recent = [...user.transactions].reverse().slice(0, 4);
  document.getElementById('recent-list').innerHTML = renderTxHTML(recent);
}

// ===== TRANSACTIONS =====
function renderTransactions() {
  const user = USERS[currentUser];
  const filter = document.getElementById('filter-type').value;
  const list = [...user.transactions].reverse().filter(t => filter === 'all' || t.type === filter);
  document.getElementById('all-transactions-list').innerHTML = renderTxHTML(list);
}

function renderTxHTML(txs) {
  if (!txs.length) return '<div class="no-transactions">No transactions found.</div>';
  return txs.map(t => {
    const isCredit = t.type === 'credit';
    const icon = isCredit ? '💰' : t.type === 'transfer-out' ? '📤' : '💳';
    return `
      <div class="tx-item">
        <div class="tx-icon ${t.type}">${icon}</div>
        <div class="tx-info">
          <div class="tx-desc">${t.desc}</div>
          <div class="tx-date">${formatDate(t.date)}</div>
        </div>
        <div class="tx-amount ${isCredit ? 'positive' : 'negative'}">
          ${isCredit ? '+' : '-'}${formatMoney(t.amount)}
        </div>
      </div>`;
  }).join('');
}

// ===== TRANSFER =====
function doTransfer() {
  const to = document.getElementById('transfer-to').value.trim();
  const acct = document.getElementById('transfer-account').value.trim();
  const amt = parseFloat(document.getElementById('transfer-amount').value);
  const note = document.getElementById('transfer-note').value.trim();
  const err = document.getElementById('transfer-error');

  if (!to) { showError(err, 'Please enter recipient name.'); return; }
  if (!acct) { showError(err, 'Please enter account number.'); return; }
  if (!amt || amt <= 0) { showError(err, 'Please enter a valid amount.'); return; }
  if (amt > USERS[currentUser].balance) { showError(err, 'Insufficient balance.'); return; }

  err.classList.add('hidden');
  USERS[currentUser].balance -= amt;
  addTransaction('debit', `Transfer to ${to}${note ? ' – ' + note : ''}`, amt);
  showToast(`$${amt.toFixed(2)} sent to ${to}`);

  document.getElementById('transfer-to').value = '';
  document.getElementById('transfer-account').value = '';
  document.getElementById('transfer-amount').value = '';
  document.getElementById('transfer-note').value = '';
  updateDashboard();
}

// ===== DEPOSIT =====
function doDeposit() {
  const amt = parseFloat(document.getElementById('deposit-amount').value);
  const desc = document.getElementById('deposit-desc').value.trim() || 'Deposit';
  const err = document.getElementById('deposit-error');

  if (!amt || amt <= 0) { showError(err, 'Enter a valid amount.'); return; }

  USERS[currentUser].balance += amt;
  addTransaction('credit', desc, amt);
  closeModal('deposit-modal');
  document.getElementById('deposit-amount').value = '';
  document.getElementById('deposit-desc').value = '';
  updateDashboard();
  renderTransactions();
  showToast(`$${amt.toFixed(2)} deposited successfully!`);
}

// ===== WITHDRAW =====
function doWithdraw() {
  const amt = parseFloat(document.getElementById('withdraw-amount').value);
  const desc = document.getElementById('withdraw-desc').value.trim() || 'Withdrawal';
  const err = document.getElementById('withdraw-error');

  if (!amt || amt <= 0) { showError(err, 'Enter a valid amount.'); return; }
  if (amt > USERS[currentUser].balance) { showError(err, 'Insufficient balance.'); return; }

  USERS[currentUser].balance -= amt;
  addTransaction('debit', desc, amt);
  closeModal('withdraw-modal');
  document.getElementById('withdraw-amount').value = '';
  document.getElementById('withdraw-desc').value = '';
  updateDashboard();
  renderTransactions();
  showToast(`$${amt.toFixed(2)} withdrawn successfully!`);
}

// ===== CARD =====
function toggleCardNumber() {
  const user = USERS[currentUser];
  const el = document.getElementById('vc-number');
  const btn = document.querySelector('.card-actions-row .btn-outline');
  if (cardRevealed) {
    el.textContent = '**** **** **** ' + user.cardNumber.slice(-4);
    btn.textContent = 'Show Number';
    cardRevealed = false;
  } else {
    el.textContent = user.cardNumber;
    btn.textContent = 'Hide Number';
    cardRevealed = true;
  }
}

// ===== HELPERS =====
function addTransaction(type, desc, amount) {
  const user = USERS[currentUser];
  user.transactions.push({
    id: Date.now(),
    type,
    desc,
    amount,
    date: new Date().toISOString().split('T')[0]
  });
}

function showTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'transactions') renderTransactions();
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id, event) {
  if (!event || event.target.id === id) {
    document.getElementById(id).classList.add('hidden');
  }
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function formatMoney(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}
