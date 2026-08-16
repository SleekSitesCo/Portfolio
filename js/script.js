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

  /* ---------- Scroll reveal: AOS (Animate On Scroll) ----------
     Elements carry data-aos="fade-up" (+ staggered data-aos-delay on grid
     rows) in the markup. If the AOS script fails to load for any reason,
     strip the data-aos attributes so AOS's CSS never leaves content stuck
     at opacity: 0. */
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.AOS && !prefersReducedMotion) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      anchorPlacement: 'top-bottom'
    });
  } else {
    document.querySelectorAll('[data-aos]').forEach(function (el) {
      el.removeAttribute('data-aos');
      el.removeAttribute('data-aos-delay');
    });
  }

  /* ---------- Hero visual: subtle pointer-tilt (desktop only, respects reduced motion) ---------- */
  var $heroVisual = $('.ss-hero-visual');
  if ($heroVisual.length && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
    var heroEl = $heroVisual[0];
    heroEl.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    heroEl.style.transformStyle = 'preserve-3d';
    var tiltRaf = null;

    heroEl.addEventListener('mousemove', function (e) {
      var rect = heroEl.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;

      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(function () {
        heroEl.style.transform = 'rotateY(' + (relX * 6) + 'deg) rotateX(' + (relY * -6) + 'deg)';
      });
    });

    heroEl.addEventListener('mouseleave', function () {
      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      heroEl.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---------- Testimonial slider: Slick ---------- */
  var $track = $('#testimonialTrack');

  if ($track.length && $.fn.slick) {
    $track.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: true,
      appendDots: $('#testimonialDots'),
      fade: true,
      adaptiveHeight: true,
      autoplay: true,
      autoplaySpeed: 6000,
      pauseOnHover: true,
      speed: 500,
      cssEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
      infinite: true
    });

    $('#testimonialPrev').on('click', function () { $track.slick('slickPrev'); });
    $('#testimonialNext').on('click', function () { $track.slick('slickNext'); });
  }

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