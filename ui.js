/* ================================================================
   UI HELPERS — Gedeelde functies voor alle pagina's
   Vereist: supabase.js vóór dit bestand geladen
   ================================================================ */

/* ---- Zijbalk ----------------------------------------------- */
async function renderZijbalk(actievePagina = 'dashboard') {
  const root = document.getElementById('zijbalk');
  if (!root) return;

  const user = await huidigGebruiker();
  const naam = user?.user_metadata?.name || user?.email?.split('@')[0] || '';

  let vakken = [];
  try {
    const { data } = await db.from('subjects').select('id, name, color').order('name');
    vakken = data || [];
  } catch (_) {}

  const nav = [
    { id: 'dashboard',    href: './dashboard.html',    icon: 'ph-squares-four',  label: 'Overzicht'    },
    { id: 'planning',     href: './planning.html',     icon: 'ph-calendar-blank', label: 'Planning'     },
    { id: 'cijfers',      href: './cijfers.html',      icon: 'ph-chart-bar',      label: 'Cijfers'      },
    { id: 'notities',     href: './notities.html',     icon: 'ph-note-pencil',    label: 'Notities'     },
    { id: 'prompts',      href: './prompts.html',      icon: 'ph-sparkle',        label: 'Prompts'      },
    { id: 'statistieken', href: './statistieken.html', icon: 'ph-chart-line-up',  label: 'Statistieken' },
    { id: 'instellingen', href: './instellingen.html', icon: 'ph-gear',           label: 'Instellingen' },
  ];

  const navHTML = nav.map(n => `
    <a href="${n.href}" class="sidebar-link ${actievePagina === n.id ? 'actief' : ''}">
      <i class="ph ${n.icon}"></i>${n.label}
    </a>`).join('');

  const vakHTML = vakken.length
    ? vakken.map(v => `
        <a href="./vak.html?id=${v.id}"
           class="sidebar-vak ${actievePagina === 'vak-' + v.id ? 'actief' : ''}">
          <span class="vak-dot" style="background:${escHTML(v.color || '#C4963A')}"></span>
          ${escHTML(v.name)}
        </a>`).join('')
    : `<span class="sidebar-vak" style="opacity:0.35;cursor:default;font-style:italic">Nog geen vakken</span>`;

  // Notificaties initialiseren (als notifications.js geladen is)
  if (typeof initNotificaties === 'function') {
    initNotificaties().catch(() => {});
  }

  root.innerHTML = `
    <nav class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-name">School Dashboard</div>
        <div class="sidebar-brand-user">${escHTML(naam)}</div>
      </div>

      <div class="sidebar-section">Menu</div>
      ${navHTML}

      <div class="sidebar-section" style="margin-top:12px">Vakken</div>
      ${vakHTML}

      <div class="sidebar-footer">
        <button class="sidebar-link" onclick="logout()">
          <i class="ph ph-sign-out"></i>Uitloggen
        </button>
      </div>
    </nav>`;
}

/* ---- Begroeting -------------------------------------------- */
function begroeting(naam = '') {
  const u = new Date().getHours();
  const w = u < 12 ? 'Goedemorgen' : u < 18 ? 'Goedemiddag' : 'Goedenavond';
  return naam ? `${w}, ${naam}` : w;
}

/* ---- Toast ------------------------------------------------- */
function toast(bericht, type = '') {
  let c = document.getElementById('toasts');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toasts'; c.className = 'toasts';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = bericht;
  c.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.2s';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 200);
  }, 3000);
}

/* ---- Modal ------------------------------------------------- */
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.overlay.open').forEach(m => m.classList.remove('open'));
});

/* ---- Datum ------------------------------------------------- */
function datumNL(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dagenTot(d) {
  const nu = new Date(); nu.setHours(0,0,0,0);
  const doel = new Date(d); doel.setHours(0,0,0,0);
  return Math.round((doel - nu) / 86400000);
}

function relatieveDatum(d) {
  const n = dagenTot(d);
  if (n === 0)  return 'Vandaag';
  if (n === 1)  return 'Morgen';
  if (n === -1) return 'Gisteren';
  if (n > 0)    return `Over ${n} dagen`;
  return `${Math.abs(n)} dagen geleden`;
}

/* ---- Veiligheid -------------------------------------------- */
function escHTML(s = '') {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ---- Bevestiging ------------------------------------------- */
function bevestig(bericht, actie) {
  if (window.confirm(bericht)) actie();
}
