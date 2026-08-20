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

  /* ---------- Smooth anchor scrolling ----------
     Handled natively: html { scroll-behavior: smooth; } in style.css does
     the animation, and .ss-section / .ss-hero carry scroll-margin-top so
     targets land below the fixed navbar instead of underneath it. No JS
     needed for the scroll itself — anchors just use their real href="#id". */

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

  /* ---------- Testimonial slider: Slick ----------
     Initialized BEFORE AOS on purpose: Slick restructures the DOM (wraps
     slides, clones extras for infinite loop), which shifts the vertical
     position of every section below it (final CTA, contact, footer). If
     AOS measures trigger points before that happens, those sections'
     triggers end up stale/too-low — which is exactly why "Let's talk" and
     Contact were animating late on desktop. */
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
      offset: 120,
      anchorPlacement: 'top-bottom'
    });

    // Safety net: webfonts swapping in (font-display: swap), the Slick
    // clones settling, and anything else that nudges layout after init
    // can leave AOS holding stale offsets for lower sections. Recalculate
    // once everything has actually finished loading.
    window.addEventListener('load', function () {
      AOS.refreshHard();
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

  /* ---------- AI Creative: phone video previews ----------
     Each phone has its own <video>. Clicking its play button plays a
     4-second looping preview of that clip; clicking again pauses it.
     Starting one preview pauses whatever else is currently playing, so
     only one plays at a time. */
  var CLIP_SECONDS = 20;
  var $phoneScreens = $('.ss-phone-screen');

  function setPlaying($screen, playing) {
    var video = $screen.find('.ss-phone-video')[0];
    var $icon = $screen.find('.ss-play-btn i');
    $screen.toggleClass('is-playing', playing);
    $icon.toggleClass('fa-play', !playing).toggleClass('fa-pause', playing);
    if (video) {
      if (playing) {
        video.play().catch(function () {
          // Autoplay/decoding blocked — fall back to the paused state.
          setPlaying($screen, false);
        });
      } else {
        video.pause();
      }
    }
  }

  $phoneScreens.each(function () {
    var $screen = $(this);
    var video = $screen.find('.ss-phone-video')[0];
    if (!video) return;

    video.addEventListener('timeupdate', function () {
      if (video.currentTime >= CLIP_SECONDS) {
        video.currentTime = 0;
        if (video.paused) video.play().catch(function () {});
      }
    });

    $screen.find('.ss-play-btn').on('click', function () {
      var isPlaying = $screen.hasClass('is-playing');

      // Pause every other phone so only one preview plays at a time.
      $phoneScreens.not($screen).each(function () {
        setPlaying($(this), false);
      });

      setPlaying($screen, !isPlaying);
    });
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

    var mailtoLink = 'mailto:sleeksites.co1@gmail.com' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    window.location.href = mailtoLink;
  });

  $form.find('.ss-input').on('input change', function () {
    $(this).removeClass('is-invalid');
  });

});
