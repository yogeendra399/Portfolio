(function () {
  'use strict';

  var root = document.documentElement;
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduceMotion = motionQuery ? motionQuery.matches : false;
  var lightThemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function getStoredTheme() {
    try { return localStorage.getItem('yk-theme'); } catch (e) { return null; }
  }

  function storeTheme(theme) {
    try { localStorage.setItem('yk-theme', theme); } catch (e) { /* storage unavailable */ }
  }

  /* ---------------- Theme toggle ---------------- */
  var themeBtn = document.getElementById('themeToggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    storeTheme(theme);
    if (themeBtn) themeBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', currentTheme() === 'light' ? 'true' : 'false');
    themeBtn.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  // Only follow OS changes if the user has never explicitly chosen a theme.
  if (!getStoredTheme() && lightThemeQuery) {
    var handleSystemThemeChange = function (e) {
      if (!getStoredTheme()) setTheme(e.matches ? 'light' : 'dark');
    };
    if (lightThemeQuery.addEventListener) {
      lightThemeQuery.addEventListener('change', handleSystemThemeChange);
    } else if (lightThemeQuery.addListener) {
      lightThemeQuery.addListener(handleSystemThemeChange);
    }
  }

  /* ---------------- Mobile menu ---------------- */
  var menuBtn = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Profile frame pointer tilt ---------------- */
  var stage = document.getElementById('cubeStage');
  var frame = document.querySelector('.profile-frame');

  if (stage && frame && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    stage.addEventListener('mousemove', function (e) {
      var rect = stage.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      frame.style.transform = 'rotateX(' + (py * -10) + 'deg) rotateY(' + (px * 14) + 'deg)';
    });
    stage.addEventListener('mouseleave', function () {
      frame.style.transform = '';
    });
  }

  /* ---------------- Interactive card tilt ---------------- */
  var cards = document.querySelectorAll('.project-card, .bento-card');
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!reduceMotion) {
    cards.forEach(function (card) {
      card.addEventListener('pointerenter', function () {
        card.classList.add('is-active');
      });
      card.addEventListener('pointermove', function (e) {
        if (!finePointer || e.pointerType === 'touch') return;
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--card-rx', (py * -7).toFixed(2) + 'deg');
        card.style.setProperty('--card-ry', (px * 9).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-active');
        card.style.setProperty('--card-rx', '0deg');
        card.style.setProperty('--card-ry', '0deg');
      });
      card.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') card.classList.add('is-active');
      });
      card.addEventListener('pointerup', function (e) {
        if (e.pointerType === 'touch') card.classList.remove('is-active');
      });
    });
  }

  /* ---------------- Sticky nav shadow on scroll ---------------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var lastState = false;
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY > 8;
      if (scrolled !== lastState) {
        nav.style.borderBottomColor = scrolled ? 'var(--border)' : 'var(--border-soft)';
        lastState = scrolled;
      }
    }, { passive: true });
  }

  /* ---------------- Scrollspy nav ---------------- */
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  function updateActiveNav() {
    var pos = window.scrollY + 120;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec;
    });
    navLinks.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + current.id;
      link.classList.toggle('active', match);
    });
  }
  if (sections.length) {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  /* ---------------- Contact form (opens email client, no fake backend) ---------------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cfName').value.trim();
      var email = document.getElementById('cfEmail').value.trim();
      var subject = document.getElementById('cfSubject').value.trim();
      var message = document.getElementById('cfMessage').value.trim();

      var body = 'From: ' + name + ' (' + email + ')\n\n' + message;
      var mailto = 'mailto:yogeendra7761@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      window.location.href = mailto;
    });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Console easter egg ---------------- */
  try {
    var art = "%c  __     __\n /\\ \\ __/\\ \\ __\n \\ \\ \\/\\ \\/ \\ \\    Y O G E E N D R A\n  \\ \\_/\\_/\\_\\    building at the intersection\n   \\/_/\\/_/       of code, data & systems\n";
    console.log(art, 'color:#818CF8;font-family:monospace;font-size:12px;');
    console.log('%cCurious enough to open devtools. I like that.', 'color:#9CA3AF;font-family:sans-serif;font-size:13px;');
    console.log('%cyogeendra7761@gmail.com — say hi, or just fork the repo.', 'color:#38BDF8;font-family:monospace;font-size:12px;');
  } catch (e) { /* console unavailable, no big deal */ }

  /* ---------------- Interactive terminal ---------------- */
  var termBody = document.getElementById('terminalBody');
  var termForm = document.getElementById('terminalForm');
  var termInput = document.getElementById('terminalInput');

  if (termBody && termForm && termInput) {
    var jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs.",
      "There are 10 types of people: those who understand binary, and those who don't.",
      "I told my SQL query a joke. No reaction — it didn't get a JOIN.",
      "My code doesn't have bugs. It has undocumented features.",
      "99 little bugs in the code, 99 little bugs — take one down, patch it around, 127 little bugs in the code."
    ];

    var commands = {
      help: "Available commands: whoami, skills, projects, sudo, joke, contact, clear",
      whoami: "yogeendra — final-year CSE student, KL University. CGPA 9.26. Probably debugging something right now.",
      skills: "SQL & PostgreSQL, Java, MERN stack, REST APIs, Power BI, Jenkins & Docker. Scroll down, it's all there — this is just the fast path.",
      projects: "3 shipped: a course management system, a health appointment platform, and a sales dashboard. Scroll to 'Work' for the real thing.",
      contact: "yogeendra7761@gmail.com · +91 76759 53476 · Vijayawada, India",
      ls: "about.md  skills.json  projects/  timeline.log  contact.txt",
      pwd: "/home/yogeendra/portfolio",
      clear: "__CLEAR__"
    };

    function printLine(text, isCommand) {
      var p = document.createElement('p');
      p.className = 'tline' + (isCommand ? ' tline-cmd' : '');
      p.textContent = text;
      termBody.appendChild(p);
      termBody.scrollTop = termBody.scrollHeight;
    }

    termForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = termInput.value.trim();
      if (!raw) return;
      printLine(raw, true);

      var key = raw.toLowerCase();
      var response;

      if (key === 'clear') {
        termBody.innerHTML = '';
        termInput.value = '';
        return;
      } else if (key === 'sudo hire me' || key === 'sudo' || key === 'sudo make me an offer') {
        response = "Permission granted. Redirecting to contact...";
        setTimeout(function () {
          var el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        }, 500);
      } else if (key === 'joke') {
        response = jokes[Math.floor(Math.random() * jokes.length)];
      } else if (commands[key]) {
        response = commands[key];
      } else {
        response = "command not found: " + raw + " — try 'help'";
      }

      printLine(response, false);
      termInput.value = '';
    });
  }

  /* ---------------- Konami code easter egg ---------------- */
  var konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var konamiPos = 0;

  function showEggToast(msg) {
    var toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 350);
    }, 3200);
  }

  document.addEventListener('keydown', function (e) {
    var expected = konami[konamiPos];
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === expected) {
      konamiPos++;
      if (konamiPos === konami.length) {
        konamiPos = 0;
        showEggToast('🎉 Konami code confirmed. You read code for fun — respect.');
      }
    } else {
      konamiPos = (key === konami[0]) ? 1 : 0;
    }
  });

})();
