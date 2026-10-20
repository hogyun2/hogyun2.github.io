// Shared header behaviour for the posts list and post pages: theme toggle,
// compact header on scroll, reading progress, and the table of contents.
(function () {
    const root = document.documentElement;
    const nav = document.getElementById('topnav');

    const themeBtn = document.getElementById('themeToggle');
    function isDark() {
        const t = root.getAttribute('data-theme');
        if (t) return t === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    function syncThemeIcon() { themeBtn.querySelector('i').className = isDark() ? 'fas fa-sun' : 'fas fa-moon'; }
    themeBtn.addEventListener('click', function () {
        const next = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        syncThemeIcon();
    });
    syncThemeIcon();

    function syncNavHeight() { root.style.setProperty('--nav-h', nav.offsetHeight + 'px'); }
    const progress = document.querySelector('.post-progress');
    const article = document.querySelector('.prose');
    function onScroll() {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 8);
        nav.classList.toggle('is-compact', y > 60);
        if (progress && article) {
            const start = article.offsetTop - window.innerHeight * 0.3;
            const end = article.offsetTop + article.offsetHeight - window.innerHeight;
            const p = Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)));
            progress.style.width = (p * 100) + '%';
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncNavHeight);
    syncNavHeight();
    onScroll();

    // Table of contents from the article's h2 headings
    const toc = document.querySelector('[data-toc]');
    if (toc && article) {
        const heads = Array.from(article.querySelectorAll('h2[id]'));
        if (!heads.length) toc.closest('.toc').hidden = true;
        heads.forEach(h => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + h.id;
            const label = h.cloneNode(true);
            label.querySelectorAll('.sec-no').forEach(n => n.remove());
            a.textContent = label.textContent.trim();
            li.appendChild(a);
            toc.appendChild(li);
        });
        const links = toc.querySelectorAll('a');
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
            });
        }, { rootMargin: '-20% 0px -70% 0px' });
        heads.forEach(h => obs.observe(h));
    }
})();
