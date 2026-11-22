(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header background on scroll
  const header = document.querySelector("[data-header]");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.style.overflow = "";
      })
    );
  }

  // Reveal on scroll
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  } else {
    items.forEach((el) => el.classList.add("is-visible"));
  }

  // Hero terminal typing loop
  const term = document.querySelector("[data-terminal]");
  if (term) {
    const scripts = [
      [
        ["p", "$ lab build --problem "],
        ["", "\"renters can't decode their leases\""],
        ["dim", "› researching landlord-tenant law · nationwide"],
        ["dim", "› prototyping with frontier models"],
        ["dim", "› testing with real renters"],
        ["ok", "✓ shipped: LeaseChat — free, nationwide"],
      ],
      [
        ["p", "$ lab new --cohort "],
        ["", "next"],
        ["dim", "› finding the next access-to-justice gap"],
        ["dim", "› students: lawyers → builders"],
        ["ok", "✓ status: in progress"],
      ],
    ];
    let s = 0;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      while (true) {
        term.innerHTML = "";
        const lines = scripts[s];
        for (let i = 0; i < lines.length; i++) {
          const [cls, text] = lines[i];
          // first two segments share a line (prompt + argument)
          let el;
          if (i === 1) {
            el = document.createElement("span");
            term.lastChild.appendChild(el);
          } else {
            el = document.createElement("div");
            if (cls) el.className = cls;
            term.appendChild(el);
          }
          if (reduce) { el.textContent = text; continue; }
          for (const ch of text) {
            el.textContent += ch;
            await sleep(i < 2 ? 34 : 14);
          }
          await sleep(i === 0 ? 60 : 420);
        }
        const caret = document.createElement("span");
        caret.className = "caret";
        term.appendChild(caret);
        if (reduce) return;
        await sleep(3800);
        s = (s + 1) % scripts.length;
      }
    };
    run();
  }

  // Hero process panel: steps light up in turn
  const pipe = document.querySelector("[data-pipeline]");
  if (pipe) {
    const steps = [...pipe.querySelectorAll("li")];
    let n = 0;
    const paint = () => steps.forEach((li, i) => {
      li.classList.toggle("is-done", i < n);
      li.classList.toggle("is-active", i === n);
    });
    if (reduce) { n = steps.length - 1; paint(); }
    else { paint(); setInterval(() => { n = (n + 1) % steps.length; paint(); }, 1800); }
  }

  // Contact form (works with Netlify Forms; falls back to email)
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      const note = form.querySelector("[data-form-status]");
      btn.disabled = true;
      btn.textContent = "Sending…";
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!res.ok) throw new Error(res.status);
        form.classList.add("is-sent");
      } catch (err) {
        btn.disabled = false;
        btn.textContent = "Send message";
        note.textContent = "We couldn't send that just now. Please email contact@uchicagoailab.com.";
      }
    });
  }

  // Slide deck viewer (blog posts)
  document.querySelectorAll("[data-deck]").forEach((deck) => {
    const slides = [...deck.querySelectorAll(".deck__stage img")];
    const prev = deck.querySelector("[data-deck-prev]");
    const next = deck.querySelector("[data-deck-next]");
    const count = deck.querySelector("[data-deck-count]");
    let i = 0;
    const show = (n) => {
      i = Math.max(0, Math.min(slides.length - 1, n));
      slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
      [i + 1, i + 2].forEach((k) => slides[k] && slides[k].removeAttribute("loading"));
      count.textContent = `${i + 1} / ${slides.length}`;
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    };
    prev.addEventListener("click", () => show(i - 1));
    next.addEventListener("click", () => show(i + 1));
    deck.tabIndex = 0;
    deck.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { show(i + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { show(i - 1); e.preventDefault(); }
    });
    let x0 = null;
    deck.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    deck.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    deck.classList.add("is-ready");
    show(0);
  });
})();
