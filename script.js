/* =========================================================
   ARENA PRO BEACH — interações
   ========================================================= */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const WHATSAPP = '5511950214708';
const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/* ---------- Horário de funcionamento (fuso de São Paulo) ---------- */
// [abre, fecha] em horas; 24 = meia-noite
const HOURS = {
    0: [8, 18],  // domingo
    1: [8, 24], 2: [8, 24], 3: [8, 24], 4: [8, 24], 5: [8, 24],
    6: [8, 20],  // sábado
};
const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const fmtHour = (h) => `${String(h % 24).padStart(2, '0')}h`;

function nowInSaoPaulo() {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, hour: Number(get('hour')) + Number(get('minute')) / 60 };
}

function openStatus() {
    const { day, hour } = nowInSaoPaulo();
    const [open, close] = HOURS[day];

    if (hour >= open && hour < close) {
        return { isOpen: true, day, title: 'Aberto agora', sub: `Fecha às ${fmtHour(close)} hoje` };
    }
    if (hour < open) {
        return { isOpen: false, day, title: 'Fechado agora', sub: `Abre hoje às ${fmtHour(open)}` };
    }
    const next = (day + 1) % 7;
    return { isOpen: false, day, title: 'Fechado agora', sub: `Abre amanhã às ${fmtHour(HOURS[next][0])}` };
}

function renderOpenStatus() {
    const s = openStatus();

    $$('[data-open-dot]').forEach((dot) => {
        dot.classList.toggle('is-open', s.isOpen);
        dot.classList.toggle('is-closed', !s.isOpen);
    });

    const heroLabel = $('[data-open-label]');
    if (heroLabel) heroLabel.textContent = `${s.title} · ${s.sub.charAt(0).toLowerCase()}${s.sub.slice(1)}`;

    const title = $('[data-open-title]');
    const sub = $('[data-open-sub]');
    if (title) title.textContent = s.title;
    if (sub) sub.textContent = s.sub;

    // destaca o dia de hoje na lista de horários
    $$('[data-hours-day]').forEach((li) => {
        const key = li.dataset.hoursDay;
        const isToday = key === 'weekdays' ? s.day >= 1 && s.day <= 5 : Number(key) === s.day;
        li.classList.toggle('is-today', isToday);
    });
}

renderOpenStatus();
setInterval(renderOpenStatus, 60_000);

/* ---------- Navbar ---------- */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// link ativo conforme a seção visível
const navLinks = $$('.nav__links a');
const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => sectionObserver.observe(s));

/* ---------- Menu mobile ---------- */
const toggle = $('.nav__toggle');
const mobileMenu = $('#mobile-menu');

function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);

    if (open) {
        mobileMenu.hidden = false;
        requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
    } else {
        mobileMenu.classList.remove('is-open');
        setTimeout(() => { if (!mobileMenu.classList.contains('is-open')) mobileMenu.hidden = true; }, 300);
    }
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
$$('a', mobileMenu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
});

/* ---------- Hero: slider de fotos ---------- */
const slides = $$('.hero__slide');
const dotsWrap = $('.hero__dots');
const SLIDE_MS = 6000;
let current = 0;
let timer;

dotsWrap.style.setProperty('--slide-ms', `${SLIDE_MS}ms`);

const loadSlide = (slide) => {
    if (slide.dataset.src) {
        slide.style.backgroundImage = `url('${slide.dataset.src}')`;
        delete slide.dataset.src;
    }
};

const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Foto ${i + 1}`);
    b.addEventListener('click', () => { goTo(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
});

function goTo(i) {
    loadSlide(slides[i]);
    loadSlide(slides[(i + 1) % slides.length]); // pré-carrega a próxima
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = i;
    slides[current].classList.add('is-active');
    // reinicia a animação da barrinha
    void dots[current].offsetWidth;
    dots[current].classList.add('is-active');
    dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === current)));
}

function restart() {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => goTo((current + 1) % slides.length), SLIDE_MS);
}

goTo(0);
restart();
document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : restart()));

/* ---------- Animações de entrada ---------- */
const revealEls = $$('[data-reveal]');

// escalona elementos irmãos (efeito cascata)
revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
    const idx = siblings.indexOf(el);
    el.style.setProperty('--d', `${Math.min(idx, 6) * 80}ms`);
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach((el) => revealObserver.observe(el));

/* ---------- Contadores ---------- */
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        counterObserver.unobserve(el);
        if (reduceMotion) return;

        const start = performance.now();
        const duration = 1200;
        const tick = (t) => {
            const p = Math.min((t - start) / duration, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
    });
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => counterObserver.observe(el));

/* ---------- Vídeo: só carrega quando aparece na tela ---------- */
const lazyVideo = $('[data-lazy-video]');
if (lazyVideo) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const v = entry.target;
            if (entry.isIntersecting) {
                const source = $('source[data-src]', v);
                if (source) {
                    source.src = source.dataset.src;
                    source.removeAttribute('data-src');
                    v.load();
                }
                if (!reduceMotion) v.play().catch(() => { });
            } else {
                v.pause();
            }
        });
    }, { threshold: 0.25 });
    videoObserver.observe(lazyVideo);
}

/* ---------- Agenda da semana ---------- */
const dayTabs = $$('.day-tabs [role="tab"]');
const agendaImg = $('[data-agenda-img]');
const agendaBtn = $('[data-agenda-btn]');

function selectDay(tab, focus = false) {
    dayTabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
    });
    if (focus) tab.focus();

    const day = Number(tab.dataset.day);
    const [open, close] = HOURS[day];
    const short = DAY_NAMES[day];

    $('[data-day-name]').textContent = tab.dataset.name;
    $('[data-day-hours]').textContent = `${fmtHour(open)} às ${fmtHour(close)}`;
    $('[data-day-short]').textContent = short;
    $('[data-day-cta]').href = waLink(`Olá! Gostaria de reservar um horário na ${tab.dataset.name.toLowerCase()}.`);

    if (agendaImg.getAttribute('src') !== tab.dataset.img) {
        agendaImg.classList.add('is-loading');
        const img = new Image();
        img.onload = () => {
            agendaImg.src = tab.dataset.img;
            agendaImg.alt = `Agenda de ${tab.dataset.name.toLowerCase()}`;
            agendaImg.classList.remove('is-loading');
        };
        img.src = tab.dataset.img;
    }
    agendaBtn.dataset.lightbox = tab.dataset.img;
}

if (dayTabs.length) {
    const today = nowInSaoPaulo().day;
    const todayTab = dayTabs.find((t) => Number(t.dataset.day) === today);
    if (todayTab) todayTab.classList.add('is-today');
    selectDay(todayTab || dayTabs[0]);

    dayTabs.forEach((tab, i) => {
        tab.addEventListener('click', () => selectDay(tab));
        tab.addEventListener('keydown', (e) => {
            const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
            if (!dir) return;
            e.preventDefault();
            selectDay(dayTabs[(i + dir + dayTabs.length) % dayTabs.length], true);
        });
    });
}

/* ---------- Spotlight nos cards de diferenciais ---------- */
$$('.feature').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
});

/* ---------- Lightbox ---------- */
const lightbox = $('#lightbox');
const lightboxImg = $('img', lightbox);

document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox]');
    if (!trigger || typeof lightbox.showModal !== 'function') return;
    lightboxImg.src = trigger.dataset.lightbox;
    lightboxImg.alt = $('img', trigger)?.alt || '';
    lightbox.showModal();
});

$('.lightbox__close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });

/* ---------- Ano no rodapé ---------- */
const year = $('[data-year]');
if (year) year.textContent = new Date().getFullYear();
