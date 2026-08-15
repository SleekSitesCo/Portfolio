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

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  var revealEls = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window) {
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
    // Fallback: reveal everything immediately
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
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
