// ===== DATA =====
const USERS = {
  user1: {
    pin: '1111',
    name: 'Alex Johnson',
    balance: 12450.00,
    cardNumber: '4532 1234 5678 9012',
    transactions: [
      { id: 1, type: 'credit', desc: 'Monthly Salary',       amount: 5000.00, date: '2026-05-01' },
      { id: 2, type: 'debit',  desc: 'Netflix Subscription', amount: 15.99,   date: '2026-05-02' },
      { id: 3, type: 'debit',  desc: 'Grocery Store',        amount: 87.50,   date: '2026-05-05' },
      { id: 4, type: 'credit', desc: 'Freelance Payment',    amount: 1200.00, date: '2026-05-08' },
      { id: 5, type: 'debit',  desc: 'Electricity Bill',     amount: 110.00,  date: '2026-05-10' },
      { id: 6, type: 'debit',  desc: 'Restaurant Dinner',    amount: 65.00,   date: '2026-05-12' },
    ]
  },
  user2: {
    pin: '2222',
    name: 'Sara Williams',
    balance: 7820.50,
    cardNumber: '5412 7654 3210 8765',
    transactions: [
      { id: 1, type: 'credit', desc: 'Salary Deposit',    amount: 3800.00, date: '2026-05-01' },
      { id: 2, type: 'debit',  desc: 'Rent Payment',      amount: 1200.00, date: '2026-05-03' },
      { id: 3, type: 'credit', desc: 'Investment Return', amount: 450.00,  date: '2026-05-06' },
      { id: 4, type: 'debit',  desc: 'Phone Bill',        amount: 55.00,   date: '2026-05-09' },
      { id: 5, type: 'debit',  desc: 'Online Shopping',   amount: 230.00,  date: '2026-05-11' },
    ]
  }
};

let currentUser = null;
let cardRevealed = false;

// ===== PARTICLES =====
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      a: Math.random()
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;
      s.a += 0.005;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${0.2 + 0.2 * Math.sin(s.a)})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== AUTH =====
function login() {
  const username = document.getElementById('login-user').value.trim();
  const pin      = document.getElementById('login-pin').value.trim();
  const err      = document.getElementById('login-error');

  if (USERS[username] && USERS[username].pin === pin) {
    currentUser = username;
    err.classList.add('hidden');
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    initApp();
  } else {
    err.classList.remove('hidden');
    document.getElementById('login-pin').value = '';
    document.getElementById('login-pin').focus();
  }
}

function logout() {
  currentUser = null; cardRevealed = false;
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pin').value = '';
}

document.getElementById('login-pin').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
document.getElementById('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

// ===== INIT =====
function initApp() {
  const user = USERS[currentUser];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = `${greet}, ${user.name.split(' ')[0]} 👋`;

  const now = new Date();
  document.getElementById('header-date').innerHTML =
    now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('sidebar-name').textContent  = user.name.split(' ')[0];
  document.getElementById('sidebar-avatar').textContent = user.name[0];
  document.getElementById('vc-name').textContent        = user.name.toUpperCase();
  document.getElementById('vc-number').textContent      = '**** **** **** ' + user.cardNumber.slice(-4);
  document.getElementById('transfer-from-account').textContent =
    `${user.name}  ·  **** ${user.cardNumber.slice(-4)}`;

  cardRevealed = false;
  document.getElementById('reveal-btn-text').textContent = 'Show Number';

  updateDashboard();
  renderTransactions();
  showTab('dashboard', document.querySelector('.nav-item'));
}

// ===== DASHBOARD =====
function updateDashboard() {
  const user = USERS[currentUser];

  animateCount('total-balance', user.balance, true);

  const income  = user.transactions.filter(t => t.type === 'credit').reduce((s,t) => s + t.amount, 0);
  const expense = user.transactions.filter(t => t.type === 'debit').reduce((s,t) => s + t.amount, 0);
  const max = Math.max(income, expense, 1);

  animateCount('total-income', income, true);
  animateCount('total-expense', expense, true);

  document.getElementById('transfer-balance').textContent = fmt(user.balance);

  setTimeout(() => {
    const ib = document.getElementById('income-bar');
    const eb = document.getElementById('expense-bar');
    if (ib) ib.style.width = (income / max * 100) + '%';
    if (eb) eb.style.width = (expense / max * 100) + '%';
  }, 100);

  const recent = [...user.transactions].reverse().slice(0, 4);
  document.getElementById('recent-list').innerHTML = txHTML(recent);
}

// ===== TRANSACTIONS =====
function renderTransactions() {
  const user   = USERS[currentUser];
  const filter = document.getElementById('filter-type')?.value || 'all';
  const list   = [...user.transactions].reverse().filter(t => filter === 'all' || t.type === filter);
  document.getElementById('all-transactions-list').innerHTML = txHTML(list);
}

function txHTML(txs) {
  if (!txs.length) return '<div class="no-transactions">No transactions found.</div>';
  return txs.map(t => {
    const credit = t.type === 'credit';
    const icon   = credit ? '💰' : t.type === 'transfer-out' ? '📤' : '💳';
    return `
      <div class="tx-item">
        <div class="tx-icon ${t.type}">${icon}</div>
        <div class="tx-info">
          <div class="tx-desc">${t.desc}</div>
          <div class="tx-date">${fmtDate(t.date)}</div>
        </div>
        <div class="tx-amount ${credit ? 'positive' : 'negative'}">
          ${credit ? '+' : '-'}${fmt(t.amount)}
        </div>
      </div>`;
  }).join('');
}

// ===== TRANSFER =====
function doTransfer() {
  const to  = document.getElementById('transfer-to').value.trim();
  const acct = document.getElementById('transfer-account').value.trim();
  const amt = parseFloat(document.getElementById('transfer-amount').value);
  const note = document.getElementById('transfer-note').value.trim();
  const err = document.getElementById('transfer-error');

  if (!to)   { showErr(err, 'Please enter a recipient name.'); return; }
  if (!acct) { showErr(err, 'Please enter an account number.'); return; }
  if (!amt || amt <= 0) { showErr(err, 'Please enter a valid amount.'); return; }
  if (amt > USERS[currentUser].balance) { showErr(err, 'Insufficient balance.'); return; }

  err.classList.add('hidden');
  USERS[currentUser].balance -= amt;
  addTx('debit', `Transfer to ${to}${note ? ' · ' + note : ''}`, amt);
  showToast(`$${amt.toFixed(2)} sent to ${to} ✓`);

  ['transfer-to','transfer-account','transfer-amount','transfer-note'].forEach(id => {
    document.getElementById(id).value = '';
  });
  updateDashboard();
}

// ===== DEPOSIT =====
function doDeposit() {
  const amt  = parseFloat(document.getElementById('deposit-amount').value);
  const desc = document.getElementById('deposit-desc').value.trim() || 'Deposit';
  const err  = document.getElementById('deposit-error');
  if (!amt || amt <= 0) { showErr(err, 'Enter a valid amount.'); return; }
  USERS[currentUser].balance += amt;
  addTx('credit', desc, amt);
  closeModal('deposit-modal');
  document.getElementById('deposit-amount').value = '';
  document.getElementById('deposit-desc').value = '';
  updateDashboard(); renderTransactions();
  showToast(`$${amt.toFixed(2)} deposited ✓`);
}

// ===== WITHDRAW =====
function doWithdraw() {
  const amt  = parseFloat(document.getElementById('withdraw-amount').value);
  const desc = document.getElementById('withdraw-desc').value.trim() || 'Withdrawal';
  const err  = document.getElementById('withdraw-error');
  if (!amt || amt <= 0)               { showErr(err, 'Enter a valid amount.'); return; }
  if (amt > USERS[currentUser].balance) { showErr(err, 'Insufficient balance.'); return; }
  USERS[currentUser].balance -= amt;
  addTx('debit', desc, amt);
  closeModal('withdraw-modal');
  document.getElementById('withdraw-amount').value = '';
  document.getElementById('withdraw-desc').value = '';
  updateDashboard(); renderTransactions();
  showToast(`$${amt.toFixed(2)} withdrawn ✓`);
}

// ===== CARD =====
function toggleCardNumber() {
  const user = USERS[currentUser];
  const el   = document.getElementById('vc-number');
  const btn  = document.getElementById('reveal-btn-text');
  cardRevealed = !cardRevealed;
  el.textContent  = cardRevealed ? user.cardNumber : '**** **** **** ' + user.cardNumber.slice(-4);
  btn.textContent = cardRevealed ? 'Hide Number' : 'Show Number';
}

// ===== HELPERS =====
function addTx(type, desc, amount) {
  USERS[currentUser].transactions.push({
    id: Date.now(), type, desc, amount,
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
  const m = document.getElementById(id);
  m.classList.remove('hidden');
}
function closeModal(id, event) {
  if (!event || event.target.id === id) {
    document.getElementById(id).classList.add('hidden');
  }
}

function showErr(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }

function fmt(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function animateCount(id, target, isMoney) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0, dur = 900;
  const startTime = performance.now();
  function step(now) {
    const p = Math.min((now - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = start + (target - start) * ease;
    el.textContent = isMoney ? fmt(val) : Math.round(val);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  const m = document.getElementById('toast-msg');
  m.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
}

// Holographic card 3D tilt
document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('holo-card');
  if (!card) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
