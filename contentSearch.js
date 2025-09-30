const pageColor = getComputedStyle(document.body).backgroundColor;

let languages = [], countries = []

const ext = (typeof browser !== 'undefined') ? browser : chrome;

if (pageColor === 'rgb(255, 255, 255)') {
  globeColor = 'rgb(70, 70, 70)'
} else {
  globeColor = 'rgb(190, 190, 190)'
}


async function loadData() {
  try {
    const [resLang, resCountry] = await Promise.all([
      fetch(ext.runtime.getURL('languages.json')),
      fetch(ext.runtime.getURL('countries.json'))
    ]);
    [languages, countries] = await Promise.all([resLang.json(), resCountry.json()]);
  } catch (e) {
    console.error('Failed to load dictionaries', e);
  }
}

(async function init(){ await Promise.all([loadData()]); main(); })();

function main() {
  // Кнопка
  const btn = document.createElement('button');
  btn.type = 'button'; btn.classList.add('language-switch-button');
  Object.assign(btn.style, {
    display: 'flex', flex: '0 1 auto', alignItems: 'center', justifyContent: 'center',
    border: 'none', padding: '0 8px', borderRadius: '5px', cursor: 'pointer',
    width: '35px', background: 'transparent', lineHeight: '44px', boxSizing: 'border-box'
  });

  const icon = document.createElement('span');
  const iconUrl = ext.runtime.getURL('icons/192.png');
  Object.assign(icon.style, {
    display: 'inline-block', width: '20px', height: '20px',
    backgroundColor: globeColor,
    WebkitMask: `url(${iconUrl}) center / contain no-repeat`,
    mask: `url(${iconUrl}) center / contain no-repeat`,
    verticalAlign: 'middle'
  });
  btn.appendChild(icon);

  waitForElement('.SDkEP').then(h=>h.appendChild(btn)).catch(()=>document.body.appendChild(btn));


 const pop = document.createElement('div');
Object.assign(pop.style, {
  position: 'fixed',
  zIndex: '2147483647',
  padding: '10px',             
  borderRadius: '20px',
  backgroundColor: pageColor,
  display: 'none',
  width: '340px',              
  boxSizing: 'border-box',
});
document.body.appendChild(pop);

// Адаптивная обводка

if (pageColor === 'rgb(255, 255, 255)') {
  pop.style.border = '1px solid rgba(0, 0, 0, 0.15)'
} else {
  pop.style.border = '1px solid rgba(147, 147, 147, 0.13)'
}

function place() {
  const r = btn.getBoundingClientRect();
  const w = pop.offsetWidth || 340;
  const h = pop.offsetHeight || 0;
  const left = Math.min(Math.max(8, r.left - w / 2), window.innerWidth - (w + 8));
  const top  = Math.min(r.bottom + 8, window.innerHeight - (h + 8));
  pop.style.left = left + 'px';
  pop.style.top  = top  + 'px';
}
window.addEventListener('resize', place);
window.addEventListener('scroll', place, { passive: true });

  const css = document.createElement('style');
  css.textContent = `
  :root {
    --gs-h: 30px; 
    --gs-font: 11.5px;
    --gs-gap: 8px;
    --gs-font-family: Roboto;
  }

  .gs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: var(--gs-gap);
    align-items: center;
  }

  .gs-pill { position: relative; }

  .gs-pill input {
    width: 100%;
    height: var(--gs-h);
    line-height: var(--gs-h);
    padding: 0 12px; 
    border-radius: 9999px;
    box-sizing: border-box;
    border: 1px solid #575859;
    background: rgba(255,255,255,.06);
    color: inherit;
    text-align: center;
    font-size: var(--gs-font);
    outline: none;
  }

  .gs-dropdown {
    position: absolute;
    left: 0; right: 0;
    top: calc(100% + 6px);
    background: ${pageColor};
    border-radius: 10px;
    max-height: 180px;
    overflow: auto;
    display: none;
    border: 1px solid rgba(109, 109, 109, 0.2);
  }

  .gs-item { padding: 8px 10px; cursor: pointer; }
  .gs-item:hover { background: rgba(255,255,255,.08); }

  .gs-apply {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--gs-h);  
    padding: 0 12px;
    border-radius: 9999px;
    border: 0;
    cursor: pointer;
    font-size: var(--gs-font);
    font-weight: 500;
  }
`;
  document.head.appendChild(css);

  function createSearchInput(options, placeholder, idSuffix) {
    const wrap = document.createElement('div'); wrap.className = 'gs-pill';
    const input = document.createElement('input'); input.placeholder = placeholder;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-haspopup', 'listbox');
    input.setAttribute('aria-expanded', 'false');

    const dropdown = document.createElement('div'); dropdown.className = 'gs-dropdown';
    const ddId = `gs-dd-${idSuffix}-${Math.random().toString(36).slice(2,7)}`;
    dropdown.id = ddId; dropdown.setAttribute('role', 'listbox');
    input.setAttribute('aria-controls', ddId);

    wrap.append(input, dropdown);

    const update = (q='') => {
      dropdown.innerHTML = '';
      const list = options.filter(o => o.name.toLowerCase().includes(q.toLowerCase()));
      const frag = document.createDocumentFragment();
      list.forEach(o => {
        const d = document.createElement('div');
        d.className = 'gs-item'; d.textContent = o.name; d.setAttribute('role', 'option');
        d.addEventListener('click', e => {
          e.stopPropagation();
          input.value = o.name;
          dropdown.style.display = 'none';
          input.setAttribute('aria-expanded', 'false');
          input.blur();
        });
        frag.appendChild(d);
      });
      dropdown.appendChild(frag);
      const open = list.length > 0;
      dropdown.style.display = open ? 'block' : 'none';
      input.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    input.addEventListener('focus', (e) => { if (e.isTrusted) update(''); });
    input.addEventListener('input', () => update(input.value));

    return { wrap, input, dropdown, update };
  }

  const grid = document.createElement('div'); grid.className = 'gs-grid';
  const lang = createSearchInput(languages, 'Language', 'lang');
  const ctr  = createSearchInput(countries, 'Country', 'ctr');

  // Стилизация кнопки Apply в зависимости от темы страницы
  const apply = document.createElement('button'); apply.className = 'gs-apply'; apply.textContent = 'Apply';
  function paintApply() {
    if (pageColor === 'rgb(255, 255, 255)') {
      apply.style.background = 'rgba(37, 36, 36, 1)';
      apply.style.border = '1px solid';
      apply.style.color = '#ffffffff';
      apply.style.borderColor = 'rgba(37, 36, 36, 1)';
    } else {
      apply.style.background = 'rgba(58, 58, 58, 1)';
      apply.style.border = '1px solid';
      apply.style.color = '#ffffffff';
      apply.style.borderColor = 'rgb(77,81,86)';
    }
  }
  paintApply();

  grid.append(lang.wrap, ctr.wrap, apply);
  pop.appendChild(grid);

  (function preset() {
    const url = new URL(location.href);
    const hl = url.searchParams.get('hl');
    const gl = url.searchParams.get('gl');
    if (hl) { const lo = languages.find(l => l.code.toLowerCase() === hl.toLowerCase()); if (lo) lang.input.value = lo.name; }
    if (gl) { const co = countries.find(c => c.code.toLowerCase() === gl.toLowerCase()); if (co) ctr.input.value = co.name; }
  })();

  apply.addEventListener('click', () => {
    const language = languages.find(l => l.name.toLowerCase() === lang.input.value.toLowerCase());
    const country  = countries.find(c => c.name.toLowerCase() === ctr.input.value.toLowerCase());
    const url = new URL(location.href);
    const before = url.searchParams.toString();
    if (language) url.searchParams.set('hl', language.code);
    if (country)  url.searchParams.set('gl', country.code.toUpperCase());
    const after = url.searchParams.toString();
    if (after !== before) {
      location.href = url.toString();
    } else {
      pop.style.display = 'none';
    }
  });

  function closeAllDropdowns() {
    for (const dd of pop.querySelectorAll('.gs-dropdown')) dd.style.display = 'none';
    for (const inp of pop.querySelectorAll('.gs-pill input')) inp.setAttribute('aria-expanded', 'false');
  }

  function closeOutside(e){ if (!pop.contains(e.target) && e.target !== btn) { pop.style.display = 'none'; closeAllDropdowns(); } }
  document.addEventListener('click', closeOutside);
  pop.addEventListener('click', (e) => {
    if (!lang.wrap.contains(e.target) && !ctr.wrap.contains(e.target)) closeAllDropdowns();
  });
  document.addEventListener('keydown', (e) => {
    const focusInside = pop.contains(document.activeElement);
    if (e.key === 'Enter' && pop.style.display !== 'none' && focusInside) apply.click();
    if (e.key === 'Escape') { pop.style.display = 'none'; closeAllDropdowns(); }
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    pop.style.display = (pop.style.display === 'none') ? 'block' : 'none';
    if (pop.style.display !== 'none') { place(); }
  });
}

function waitForElement(selector, root = document, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const found = root.querySelector(selector);
    if (found) return resolve(found);
    const obs = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) { obs.disconnect(); resolve(el); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => { obs.disconnect(); reject(new Error('not found')); }, timeout);
  });
}
