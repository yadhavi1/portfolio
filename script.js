
const SB_URL = 'https://wfjjjwoeuablnrkcxqag.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmampqd29ldWFibG5ya2N4cWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzAwMjksImV4cCI6MjA4NzcwNjAyOX0.UiYMRIyZXsr8cgYdspqgrDw4Pdq5OPoZVSLfdtoV4lQ';

//PROGRESS BAR
const prog = document.getElementById('progress');
window.addEventListener('scroll', () => {
  prog.style.width = (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
});

// FLOATING PETAL CANVAS 
const canvas = document.getElementById('petalCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PETAL_COUNT = 26;
const petals = Array.from({ length: PETAL_COUNT }, () => spawnPetal(true));

function spawnPetal(randomY = false) {
  return {
    x:        Math.random() * window.innerWidth,
    y:        randomY ? Math.random() * window.innerHeight : -20,
    size:     Math.random() * 7 + 3,
    speedY:   Math.random() * 0.6 + 0.25,
    speedX:   (Math.random() - 0.5) * 0.4,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.018,
    opacity:  Math.random() * 0.45 + 0.1,
    color:    Math.random() > 0.5 ? '#e8829a' : '#d4af7a',
  };
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle   = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach((p, i) => {
    drawPetal(p);
    p.x        += p.speedX;
    p.y        += p.speedY;
    p.rotation += p.rotSpeed;
    if (p.y > canvas.height + 20) petals[i] = spawnPetal(false);
  });
  requestAnimationFrame(animatePetals);
}
animatePetals();

//  SKILL BARS 
const obs = new IntersectionObserver(entries => {
  entries.forEach(x => { if (x.isIntersecting) x.target.style.animationPlayState = 'running'; });
}, { threshold: 0.1 });
document.querySelectorAll('.skill-bar').forEach(bar => {
  bar.style.animationPlayState = 'paused';
  obs.observe(bar);
});

// PDF CERTIFICATES 
const pdfURLs = [
  'html.pdf',
  'css.pdf',
  'frontend.pdf',
  'digital.pdf',
  'aws.pdf',
  'js.pdf',
  'git.pdf',
  'nodejs.pdf',
];

const certNames = [
  'HTML Essentials',
  'CSS Styling & Design',
  'Front-End Web Developer',
  'Digital Engineering Languages',
  'AWS Cloud Practitioner',
  'JavaScript Essentials',
  'Git & Version Control',
  'Node.js Fundamentals',
];

// Use .certs-row for the horizontal scroll layout
document.querySelector('.certs-row').addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-action="view"]');
  if (!btn) return;
  openPdf(parseInt(btn.dataset.idx));
});

function openPdf(idx) {
  document.getElementById('pdfModalTitle').textContent = '✦ ' + certNames[idx].toUpperCase();
  document.getElementById('pdfModal').classList.add('open');
  document.getElementById('pdfFrame').src = pdfURLs[idx];
}

function closePdf() {
  document.getElementById('pdfModal').classList.remove('open');
  document.getElementById('pdfFrame').src = '';
}

document.getElementById('pdfModal').addEventListener('click', function (e) {
  if (e.target === this) closePdf();
});
document.querySelector('.pdf-close').addEventListener('click', closePdf);

// ── CONTACT FORM → SUPABASE ──
async function sendPing() {
  const name  = document.getElementById('pName').value.trim();
  const email = document.getElementById('pEmail').value.trim();
  const msg   = document.getElementById('pMsg').value.trim();
  const err   = document.getElementById('pingErr');
  const btn   = document.getElementById('pingBtn');
  const btext = document.getElementById('pingBtnText');
  const spin  = document.getElementById('pingSpinner');

  err.style.display = 'none';
  ['pName','pEmail','pMsg'].forEach(id => document.getElementById(id).classList.remove('err'));

  const errors = [];
  if (!name)  { errors.push('Name required.');        document.getElementById('pName').classList.add('err'); }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email required.');
    document.getElementById('pEmail').classList.add('err');
  }
  if (!msg)   { errors.push('Message required.');     document.getElementById('pMsg').classList.add('err'); }
  if (errors.length) { err.textContent = '✦ ' + errors.join(' '); err.style.display = 'block'; return; }

  if (SB_URL === 'YOUR_SUPABASE_URL' || SB_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    err.textContent = '✦ Supabase credentials not set yet. Add your URL and anon key in yadhavi-script.js.';
    err.style.display = 'block'; return;
  }

  btn.setAttribute('disabled', '');
  btext.style.display = 'none';
  spin.style.display  = 'block';

  try {
    const res = await fetch(`${SB_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({ name, email, message: msg })
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || `HTTP ${res.status}`);
    }

    document.getElementById('pingForm').style.display = 'none';
    document.getElementById('pingSuccess').classList.add('show');
    document.getElementById('pingTs').textContent =
      '✦ Sent at ' + new Date().toLocaleTimeString() + ' · ' + new Date().toLocaleDateString();

  } catch (e) {
    err.innerHTML = '✦ ' + e.message +
      '<br><span style="opacity:.6;font-size:.9em">Check Supabase URL, anon key and table name <code style="color:var(--rose3)">messages</code>.</span>';
    err.style.display = 'block';
    btn.removeAttribute('disabled');
    btext.style.display = '';
    spin.style.display  = 'none';
  }
}

function resetPing() {
  ['pName','pEmail','pMsg'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('err');
  });
  document.getElementById('pingErr').style.display     = 'none';
  document.getElementById('pingSuccess').classList.remove('show');
  document.getElementById('pingForm').style.display    = 'block';
  document.getElementById('pingBtn').removeAttribute('disabled');
  document.getElementById('pingBtnText').style.display = '';
  document.getElementById('pingSpinner').style.display = 'none';
}
