// Loads the people lists and programmes from data.js (or data.json)
async function loadSiteData() {
  try {
    // Uses data.js when present (works everywhere); falls back to data.json on a web server
    let data = window.SITE_DATA;
    if (!data) {
      const response = await fetch('data.json');
      if (!response.ok) throw new Error('Could not load data.json');
      data = await response.json();
    }

    const fillList = (id, items) => {
      const ul = document.getElementById(id);
      if (!ul || !items) return;
      ul.textContent = '';
      items.forEach(item => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        name.className = 'name';
        if (item && typeof item === 'object') {
          name.textContent = item.name;
          li.appendChild(name);
          if (item.role) {
            const role = document.createElement('span');
            role.className = 'role';
            role.textContent = item.role;
            li.appendChild(role);
          }
        } else {
          name.textContent = item;
          li.appendChild(name);
        }
        ul.appendChild(li);
      });
    };

    fillList('list-officers', data.officers);
    fillList('list-ncos', data.ncos);
    fillList('list-anchors', data.anchor_boys);
    fillList('list-company', data.company_section);
    fillList('list-exco', data.exco);
    fillList('list-patrons', data.patrons);

    // Show how many people are in each group
    document.querySelectorAll('.acc-btn').forEach(btn => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const n = panel ? panel.querySelectorAll('li').length : 0;
      btn.querySelector('.count').textContent = n || '';
    });

    // Names under the leadership photos (taken from the EXCO list)
    document.querySelectorAll('.leader-card[data-role]').forEach(card => {
      const person = (data.exco || []).find(p => p.role === card.dataset.role);
      const slot = card.querySelector('.leader-name');
      if (person && slot) slot.textContent = person.name;
    });

    renderEvents(data.events || []);
  } catch (err) {
    console.error('Error loading data.json:', err);
    const box = document.getElementById('events-container');
    if (box) {
      box.innerHTML = '<p class="empty">Programmes could not be loaded right now. Please check back soon.</p>';
    }
    document.querySelectorAll('.panel ul').forEach(ul => {
      ul.innerHTML = '<li><span class="name">The list could not be loaded. Check that data.js is in the same folder as index.html.</span></li>';
    });
  }
}

function renderEvents(events) {
  const box = document.getElementById('events-container');
  if (!box) return;
  box.textContent = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter(e => new Date(e.compareDate) >= today)
    .sort((a, b) => new Date(a.compareDate) - new Date(b.compareDate));

  if (!upcoming.length) {
    box.innerHTML = '<p class="empty">No upcoming programmes at the moment. Check back soon!</p>';
    return;
  }

  upcoming.forEach(e => {
    const card = document.createElement('article');
    card.className = 'event-card';
    const title = document.createElement('h4');
    title.textContent = e.title;
    const meta = document.createElement('div');
    meta.className = 'event-meta';
    meta.textContent = [e.dateString, e.time].filter(Boolean).join(' | ');
    const desc = document.createElement('p');
    desc.textContent = e.description;
    card.append(title, meta, desc);
    box.appendChild(card);
  });
}

// Accordion: one panel open at a time
function setupAccordion() {
  const buttons = document.querySelectorAll('.acc-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';
      buttons.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      });
      if (!wasOpen) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
      }
    });
  });
}

// Headline: words rise in, then a gentle wave repeats every 5 seconds
function animateHeadline() {
  const h = document.getElementById('hero-title');
  const hero = document.querySelector('.hero');
  if (!h || !hero) return;

  const words = h.textContent.trim().split(/\s+/);
  h.setAttribute('aria-label', words.join(' '));
  h.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    s.textContent = w;
    h.appendChild(s);
    if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
  });

  const n = words.length;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let doneT = null, waveT = null, loopT = null;

  function start() {
    hero.classList.add('play');
    clearTimeout(doneT);
    doneT = setTimeout(() => hero.classList.add('done'), n * 120 + 1000);
    if (reduce) return;
    clearInterval(loopT);
    loopT = setInterval(() => {
      if (document.hidden || !hero.classList.contains('done')) return;
      h.classList.remove('wave'); void h.offsetWidth; h.classList.add('wave');
      clearTimeout(waveT);
      waveT = setTimeout(() => h.classList.remove('wave'), n * 90 + 900);
    }, 5000);
  }
  function stop() {
    clearTimeout(doneT); clearTimeout(waveT); clearInterval(loopT);
    h.classList.remove('wave');
    hero.classList.remove('play', 'done');
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!hero.classList.contains('play')) start(); }
        else if (e.intersectionRatio === 0) { stop(); }
      });
    }, { threshold: [0, 0.25] }).observe(hero);
  } else {
    start();
  }
}


// Contact form: sends the message to the company through Formspree
// Paste YOUR Formspree form link here, e.g. "https://formspree.io/f/abcdwxyz"
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const note = document.getElementById('form-note');
  const btn = form.querySelector('button[type=submit]');

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
      note.textContent = 'The message form is not connected yet. Please try again later.';
      note.className = 'note error';
      return;
    }
    btn.disabled = true; btn.textContent = 'Sending...';
    note.className = 'note'; note.textContent = '';

    fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(r => {
        if (!r.ok) throw new Error('failed');
        form.reset();
        note.textContent = 'Thank you. Your message has been sent and we will reply soon.';
        note.className = 'note success';
      })
      .catch(() => {
        note.textContent = 'Your message could not be sent. Please try again in a moment.';
        note.className = 'note error';
      })
      .finally(() => { btn.disabled = false; btn.textContent = 'Send message'; });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  animateHeadline();
  setupAccordion();
  setupContactForm();
  loadSiteData();
});
