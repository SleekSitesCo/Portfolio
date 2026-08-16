/* ==========================================================================
   SleekSites.co — script.js
   Lightweight jQuery + vanilla JS interactions. No extra libraries.
   ========================================================================== */

$(function () {

  /* ---------- Navbar scroll state ---------- */
  var $navbar = $('#mainNav');

  function updateNavbarState() {
    if ($(window).scrollTop() > 40) {
      $navbar.addClass('ss-scrolled');
    } else {
      $navbar.removeClass('ss-scrolled');
    }
  }
  updateNavbarState();
  $(window).on('scroll', updateNavbarState);

  /* ---------- Collapse mobile menu after link click ---------- */
  var $navCollapse = $('#navContent');
  $navCollapse.find('a').on('click', function () {
    if ($navCollapse.hasClass('show')) {
      bootstrap.Collapse.getOrCreateInstance($navCollapse[0]).hide();
    }
  });

  /* ---------- Smooth anchor scrolling ---------- */
  $('a[href^="#"]').on('click', function (e) {
    var targetId = $(this).attr('href');
    if (targetId === '#' || targetId.length < 2) return;
    var $target = $(targetId);
    if ($target.length) {
      e.preventDefault();
      var offset = $target.offset().top - 84;
      $('html, body').animate({ scrollTop: offset }, 650, 'swing');
    }
  });

  /* ---------- Back to top button ---------- */
  var $backToTop = $('#backToTop');
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 600) {
      $backToTop.addClass('show');
    } else {
      $backToTop.removeClass('show');
    }
  });
  $backToTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600);
  });

  /* ---------- Scroll reveal ----------
     GSAP + ScrollTrigger when available (smoother, staggered easing);
     falls back to IntersectionObserver, then to "reveal everything" so
     content is never stuck invisible if a CDN script fails to load. */
  var revealEls = document.querySelectorAll('.reveal-up');
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Group elements that land in the same viewport chunk so they stagger
    // together rather than firing one ScrollTrigger per element.
    var groups = {};
    revealEls.forEach(function (el) {
      var key = Math.round(el.getBoundingClientRect().top / 200);
      groups[key] = groups[key] || [];
      groups[key].push(el);
    });

    Object.keys(groups).forEach(function (key) {
      var group = groups[key];
      gsap.set(group, { autoAlpha: 0, y: 32 });
      ScrollTrigger.create({
        trigger: group[0],
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(group, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
            onComplete: function () {
              group.forEach(function (el) { el.classList.add('in-view'); });
            }
          });
        }
      });
    });
  } else if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = (index % 4) * 70;
          setTimeout(function () {
            el.classList.add('in-view');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback / reduced motion: reveal everything immediately
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Hero visual: subtle pointer-tilt (desktop only, respects reduced motion) ---------- */
  var $heroVisual = $('.ss-hero-visual');
  if ($heroVisual.length && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
    var heroEl = $heroVisual[0];
    var tiltRaf = null;

    heroEl.addEventListener('mousemove', function (e) {
      var rect = heroEl.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;

      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(function () {
        if (window.gsap) {
          gsap.to(heroEl, { rotateY: relX * 6, rotateX: relY * -6, duration: 0.6, ease: 'power2.out', transformPerspective: 1200 });
        }
      });
    });

    heroEl.addEventListener('mouseleave', function () {
      if (window.gsap) {
        gsap.to(heroEl, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' });
      }
    });
  }

  /* ---------- Testimonial carousel controls (custom dots synced to Bootstrap carousel) ---------- */
  var $carousel = $('#testimonialCarousel');
  var $dotsWrap = $('#testimonialDots');
  var slideCount = $carousel.find('.carousel-item').length;

  for (var i = 0; i < slideCount; i++) {
    var $dot = $('<span></span>').attr('data-index', i);
    if (i === 0) $dot.addClass('active');
    $dotsWrap.append($dot);
  }

  var bsCarousel = bootstrap.Carousel.getOrCreateInstance($carousel[0], { interval: 6000, ride: 'carousel' });

  $dotsWrap.on('click', 'span', function () {
    var index = $(this).data('index');
    bsCarousel.to(index);
  });

  $('#testimonialPrev').on('click', function () { bsCarousel.prev(); });
  $('#testimonialNext').on('click', function () { bsCarousel.next(); });

  $carousel.on('slid.bs.carousel', function (e) {
    $dotsWrap.find('span').removeClass('active').eq(e.to).addClass('active');
  });

  /* ---------- Contact form: client-side validation + mailto ---------- */
  var $form = $('#contactForm');

  $form.on('submit', function (e) {
    e.preventDefault();
    var valid = true;

    $form.find('[required]').each(function () {
      var $field = $(this);
      var value = $.trim($field.val());
      var isEmail = $field.attr('type') === 'email';
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      var fieldValid = value.length > 0 && (!isEmail || emailPattern.test(value));

      if (!fieldValid) {
        $field.addClass('is-invalid');
        valid = false;
      } else {
        $field.removeClass('is-invalid');
      }
    });

    if (!valid) return;

    // Build a mailto link with the form contents pre-filled.
    // Swap this block for a fetch() call to Formspree/Netlify Forms when ready.
    var name = $.trim($('#name').val());
    var email = $.trim($('#email').val());
    var company = $.trim($('#company').val());
    var projectType = $.trim($('#projectType').val());
    var budget = $.trim($('#budget').val());
    var message = $.trim($('#message').val());

    var subject = 'New project inquiry from ' + name;
    var body =
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Company: ' + (company || '—') + '\n' +
      'Project Type: ' + (projectType || '—') + '\n' +
      'Budget: ' + (budget || '—') + '\n\n' +
      'Message:\n' + message;

    var mailtoLink = 'mailto:hello@sleeksites.co' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    window.location.href = mailtoLink;
  });

  $form.find('.ss-input').on('input change', function () {
    $(this).removeClass('is-invalid');
  });

});