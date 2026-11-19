/**
 * MOST CREATIVE PORTFOLIO - MAIN INTERACTIVE JAVASCRIPT
 */

/* ==========================================================================
   BUENA VIDA ON-THEME MINIMAL LUXURY PRELOADER CONTROLLER
   ========================================================================== */
function initPreloader() {
  const loader = document.querySelector('.js-loader');
  if (!loader) return;

  const progressBar = document.querySelector('.js-preloader-bar');
  const percentageEl = document.querySelector('.js-loader-percentage');

  let targetProgress = 0;
  let currentProgress = 0;
  let isComplete = false;
  let rafId = null;

  // Track images using imagesLoaded if available
  if (typeof window.imagesLoaded === 'function') {
    const imgLoad = window.imagesLoaded(document.body, { background: true });
    const totalImages = Math.max(imgLoad.images.length, 1);
    let loadedCount = 0;

    imgLoad.on('progress', () => {
      loadedCount++;
      const p = Math.min(Math.round((loadedCount / totalImages) * 100), 96);
      if (p > targetProgress) {
        targetProgress = p;
      }
    });

    imgLoad.on('always', () => {
      targetProgress = 100;
    });
  }

  // Always complete when page fully loads
  if (document.readyState === 'complete') {
    targetProgress = 100;
  } else {
    window.addEventListener('load', () => {
      targetProgress = 100;
    });
  }

  // Safety timeout: unlock after 2.5s max even on slow connections
  setTimeout(() => {
    targetProgress = 100;
  }, 2500);

  const updateLoader = () => {
    if (isComplete) return;

    if (currentProgress < targetProgress) {
      const step = Math.max(0.6, (targetProgress - currentProgress) * 0.09);
      currentProgress = Math.min(targetProgress, currentProgress + step);
    } else if (targetProgress === 0) {
      // Smooth initial advance
      currentProgress = Math.min(22, currentProgress + 0.4);
    }

    const displayVal = Math.min(100, Math.floor(currentProgress));
    if (percentageEl) {
      percentageEl.textContent = displayVal;
    }

    if (progressBar) {
      progressBar.style.width = `${currentProgress}%`;
    }

    if (currentProgress >= 99.5 && !isComplete) {
      isComplete = true;
      cancelAnimationFrame(rafId);

      if (percentageEl) percentageEl.textContent = '100';
      if (progressBar) progressBar.style.width = '100%';

      // Smooth pause at 100% to conclude the load
      setTimeout(() => {
        loader.classList.add('loaded');
        document.body.classList.remove('is-loading');

        if (window.lenis) {
          window.lenis.start();
        }

        setTimeout(() => {
          loader.style.display = 'none';
        }, 900);
      }, 260);

      return;
    }

    rafId = requestAnimationFrame(updateLoader);
  };

  rafId = requestAnimationFrame(updateLoader);
}

// Start preloader as early as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloader);
} else {
  initPreloader();
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const slides = document.querySelectorAll('.slide-item');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const currentNumEl = document.querySelector('.num-current');
  const totalNumEl = document.querySelector('.num-total');
  const progressFill = document.querySelector('.progress-fill-bar');
  const progressTrack = document.querySelector('.progress-track-bar');
  
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const searchToggleBtn = document.getElementById('searchToggleBtn');
  const searchModal = document.getElementById('searchModal');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const mainNav = document.getElementById('mainNav');
  const siteHeader = document.querySelector('.site-header');

  let currentIndex = 0;
  const totalSlides = slides.length;
  const DURATION = 6000; // 6 seconds per slide
  let startTime = null;
  let animFrameId = null;
  let isPaused = false;

  // Format number with leading zero (e.g., 01, 02)
  const formatNum = (num) => (num < 10 ? `0${num}` : `${num}`);

  // Set total slide count label
  if (totalNumEl) {
    totalNumEl.textContent = formatNum(totalSlides);
  }

  const sliderContainer = document.querySelector('.slider-container');

  // Function to show specific slide with horizontal slide transition
  function goToSlide(index) {
    // Normalize index
    if (index >= totalSlides) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = totalSlides - 1;
    } else {
      currentIndex = index;
    }

    // Translate slider container track horizontally (Right-to-Left slide)
    if (sliderContainer) {
      sliderContainer.style.transform = `translateX(-${currentIndex * 100}vw)`;
    }

    // Toggle active state for content animations
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Counter
    if (currentNumEl) {
      currentNumEl.textContent = formatNum(currentIndex + 1);
    }

    // Pause inactive slide WebGL loops, play active slide loop
    try {
      if (typeof $ !== 'undefined' && typeof $.fn.ripples === 'function') {
        $('.slide-item:not(.active) .slide-bg').each(function() {
          if ($(this).data('ripples')) {
            try { $(this).ripples('pause'); } catch(e) {}
          }
        });
        const $activeBg = $('.slide-item.active .slide-bg');
        if ($activeBg.length && $activeBg.data('ripples')) {
          try { $activeBg.ripples('play'); } catch(e) {}
        }
      }
    } catch(e) {}

    // Trigger gentle liquid drop on newly active slide
    try {
      const activeSlide = slides[currentIndex];
      if (activeSlide && typeof $ !== 'undefined') {
        const $bg = $(activeSlide).find('.slide-bg');
        if ($bg.length && $bg.data('ripples')) {
          setTimeout(() => {
            try {
              const w = $bg.width() || 800;
              const h = $bg.height() || 600;
              $bg.ripples('drop', w * 0.6, h * 0.48, 22, 0.02);
            } catch(e) {}
          }, 350);
        }
      }
    } catch (e) {}

    // Restart Timer Animation
    resetTimer();
  }

  // Next & Prev actions
  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Progress Timer Bar Animation Loop
  function animateProgress(timestamp) {
    if (!startTime) startTime = timestamp;
    if (!isPaused) {
      const elapsed = timestamp - startTime;
      const progressPercent = Math.min((elapsed / DURATION) * 100, 100);

      if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
      }

      if (elapsed >= DURATION) {
        nextSlide();
        return;
      }
    } else {
      // Offset start time while paused so progress resumes seamlessly
      startTime = timestamp - (parseFloat(progressFill.style.width || '0') / 100) * DURATION;
    }

    animFrameId = requestAnimationFrame(animateProgress);
  }

  function resetTimer() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (progressFill) progressFill.style.width = '0%';
    startTime = null;
    animFrameId = requestAnimationFrame(animateProgress);
  }

  // Pause timer on hover over controls/content
  const sliderSection = document.querySelector('.hero-slider-section');
  if (sliderSection) {
    sliderSection.addEventListener('mouseenter', () => { isPaused = true; });
    sliderSection.addEventListener('mouseleave', () => { isPaused = false; });
  }

  // Event Listeners for Nav Arrows
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Click on progress track to jump slide
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      const targetIndex = Math.floor(ratio * totalSlides);
      goToSlide(targetIndex);
    });
  }

  // Keyboard Arrow Navigation
  document.addEventListener('keydown', (e) => {
    if (searchModal && searchModal.classList.contains('active')) {
      if (e.key === 'Escape') closeSearch();
      return;
    }
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  });

  // Touch Swipe Gesture Navigation
  let touchStartX = 0;
  let touchEndX = 0;

  if (sliderSection) {
    sliderSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      nextSlide(); // Swipe left
    } else if (touchEndX - touchStartX > swipeThreshold) {
      prevSlide(); // Swipe right
    }
  }

  // ==========================================================================
  // THEME SWITCHER (LIGHT / DARK MODE - DEFAULT: LIGHT)
  // ==========================================================================
  const savedTheme = localStorage.getItem('most_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('most_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'light') {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>`;
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`;
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  }

  // ==========================================================================
  // SEARCH MODAL CONTROLLER
  // ==========================================================================
  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput && searchInput.focus(), 150);
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (searchToggleBtn) searchToggleBtn.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // ==========================================================================
  // MOBILE NAVIGATION CONTROLLER
  // ==========================================================================
  if (mobileToggleBtn && mainNav) {
    mobileToggleBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mobileToggleBtn.classList.toggle('active');
    });
  }

  // Smart Navbar: Hide on scroll down, reveal on scroll up
  let lastScrollY = window.scrollY;
  const siteHeaderWrap = document.querySelector('.site-header-wrap');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 40) {
      siteHeader && siteHeader.classList.add('scrolled');
    } else {
      siteHeader && siteHeader.classList.remove('scrolled');
    }

    const modal = document.getElementById('shopModal');
    const isModalOpen = modal && modal.classList.contains('is-open');

    if (currentScrollY > 180 && currentScrollY > lastScrollY && !isModalOpen) {
      // Scrolling down -> Hide navbar
      siteHeaderWrap && siteHeaderWrap.classList.add('nav-hidden');
    } else {
      // Scrolling up or near top -> Show navbar
      siteHeaderWrap && siteHeaderWrap.classList.remove('nav-hidden');
    }

    lastScrollY = Math.max(0, currentScrollY);
  }, { passive: true });

  // Back to Top Button & Smooth Anchor Navigation
  const backTopBtn = document.getElementById('backTopBtn');
  if (backTopBtn) {
    backTopBtn.addEventListener('click', () => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      // Bypass smooth scroll for Shop Now triggers so modal opens without scrolling
      if (this.classList.contains('js-shop-trigger') || this.hasAttribute('data-shop-modal')) {
        return;
      }
      const text = (this.textContent || '').trim().toLowerCase();
      if (text.includes('shop now') || text === 'shop') {
        return;
      }
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId || targetId === '#shop') return;
      try {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenisInstance) {
            lenisInstance.scrollTo(targetEl, { offset: -20, duration: 1.2 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } catch (err) {}
    });
  });

  // ==========================================================================
  // MOKKO SCROLL REVEAL TEXT & CARD ANIMATIONS (BIDIRECTIONAL SCROLL UP & DOWN)
  // ==========================================================================
  const revealTargets = document.querySelectorAll('.reveal-on-scroll, .section-label, .product-card-item, .horizontal-carousel-wrap');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, observerOptions);

  revealTargets.forEach((el, index) => {
    el.classList.add('reveal-on-scroll');
    if (el.classList.contains('product-card-item')) {
      el.style.transitionDelay = `${(index % 3) * 0.15}s`;
    }
    scrollObserver.observe(el);
  });

  // ==========================================================================
  // MOKKO SCROLL-DRIVEN WORD HIGHLIGHT REVEAL ENGINE (HIGH PERFORMANCE CACHED)
  // ==========================================================================
  const scrollTextBlocks = document.querySelectorAll('.statement-text-bold');
  const scrollTextData = [];

  scrollTextBlocks.forEach((block) => {
    // Preserve original text content and construct word spans
    const fullText = block.textContent.trim();
    const words = fullText.split(/\s+/);
    
    block.innerHTML = '';
    const wordSpans = [];
    words.forEach((word) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'scroll-word';
      wordSpan.textContent = word + ' ';
      block.appendChild(wordSpan);
      wordSpans.push(wordSpan);
    });

    scrollTextData.push({
      block,
      words: wordSpans,
      lastActiveIndex: -999
    });
  });

  let wordHighlightTicking = false;
  function updateWordHighlights() {
    if (wordHighlightTicking) return;
    wordHighlightTicking = true;

    requestAnimationFrame(() => {
      const windowHeight = window.innerHeight;
      const startPos = windowHeight * 0.88;
      const endPos = windowHeight * 0.28;
      const totalDistance = startPos - endPos;

      for (let i = 0; i < scrollTextData.length; i++) {
        const item = scrollTextData[i];
        const rect = item.block.getBoundingClientRect();

        // Fast viewport boundary cull: avoid work when completely above or below viewport
        if (rect.bottom < 0) {
          if (item.lastActiveIndex !== item.words.length - 1) {
            item.lastActiveIndex = item.words.length - 1;
            for (let j = 0; j < item.words.length; j++) item.words[j].classList.add('active');
          }
          continue;
        }
        if (rect.top > windowHeight) {
          if (item.lastActiveIndex !== -1) {
            item.lastActiveIndex = -1;
            for (let j = 0; j < item.words.length; j++) item.words[j].classList.remove('active');
          }
          continue;
        }

        const currentPos = startPos - rect.top;
        const progress = Math.max(0, Math.min(1, currentPos / totalDistance));
        const activeThresholdIndex = progress <= 0.02 ? -1 : Math.floor(progress * item.words.length);

        // Only touch the DOM when threshold actually changes!
        if (activeThresholdIndex !== item.lastActiveIndex) {
          item.lastActiveIndex = activeThresholdIndex;
          for (let j = 0; j < item.words.length; j++) {
            if (j <= activeThresholdIndex) {
              item.words[j].classList.add('active');
            } else {
              item.words[j].classList.remove('active');
            }
          }
        }
      }
      wordHighlightTicking = false;
    });
  }

  window.addEventListener('resize', updateWordHighlights, { passive: true });
  updateWordHighlights();

  // ==========================================================================
  // INERTIA SMOOTH SCROLLING (LENIS) & UNIFIED GSAP TICKER
  // ==========================================================================
  let lenisInstance = null;
  if (typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false
    });
    window.lenis = lenisInstance;

    // Pause scroll while preloader is active
    if (document.body.classList.contains('is-loading')) {
      lenisInstance.stop();
    }

    lenisInstance.on('scroll', updateWordHighlights);

    if (typeof gsap !== 'undefined') {
      lenisInstance.on('scroll', () => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.update();
        }
      });
      // Synchronize Lenis and ScrollTrigger in a single unified tick loop
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // ==========================================================================
  // SCROLL-LINKED PARALLAX & REVEAL ANIMATIONS (ALL SECTIONS)
  // ==========================================================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO SECTION SCROLL-LINKED PARALLAX
    const heroSection = document.querySelector('.hero-slider-section');
    if (heroSection) {
      gsap.to('.hero-content', {
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: -60,
        opacity: 0.75,
        ease: 'none'
      });

      gsap.to('.slide-bg', {
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        },
        y: 80,
        ease: 'none'
      });
    }

    // 2. ABOUT STORY SECTION SCROLL-LINKED PARALLAX
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      gsap.to('.about-image-box', {
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -40,
        ease: 'none'
      });

      gsap.to('.about-text-content', {
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        },
        y: 20,
        ease: 'none'
      });
    }

    // 3. CONTINUOUS MOVING GALLERY & BRAND FEATURE SECTION
    const featureSection = document.querySelector('.moving-feature-section');
    if (featureSection) {
      ScrollTrigger.create({
        trigger: featureSection,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          const gallery = featureSection.querySelector('.moving-gallery-mask');
          const textItems = featureSection.querySelectorAll('.feature-headline, .feature-description, .feature-benefits-row, .feature-icons-grid, .section-cta, .feature-shop-btn');

          if (gallery) {
            gsap.fromTo(gallery,
              { opacity: 0 },
              { opacity: 1, duration: 0.9, ease: 'power3.out' }
            );
          }

          if (textItems.length) {
            gsap.fromTo(textItems,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );
          }
        }
      });
    }

    // 4. TILTED GALLERY STREAM SCROLL-LINKED HORIZONTAL MOTION (LEFT/RIGHT ON SCROLL)
    const tiltedSection = document.querySelector('.tilted-gallery-section');
    const tiltedTrack = document.querySelector('.tilted-gallery-track');
    if (tiltedSection && tiltedTrack) {
      gsap.to(tiltedTrack, {
        scrollTrigger: {
          trigger: tiltedSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
        x: '-38%',
        ease: 'none'
      });
    }

    // 5. FOOTER SECTION BIDIRECTIONAL SCROLL REVEAL & WATER PARALLAX (SCROLL UP & DOWN)
    const footerSection = document.querySelector('.site-footer-section');
    const footerCard = document.querySelector('.footer-card-box');
    if (footerSection && footerCard) {
      // Card container reveal scale, fade, and lift animation on scroll up and down (slower, cinematic pace)
      gsap.fromTo(footerCard,
        {
          opacity: 0,
          y: 95,
          scale: 0.88,
          transformOrigin: 'center center'
        },
        {
          scrollTrigger: {
            trigger: footerCard,
            start: 'top 86%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse'
          },
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.8,
          ease: 'power2.out'
        }
      );

      // Water Waves background parallax scrub effect as user scrolls up and down (GPU Accelerated)
      const footerBg = footerCard.querySelector('.footer-card-bg');
      if (footerBg) {
        gsap.fromTo(footerBg,
          { yPercent: -14 },
          {
            scrollTrigger: {
              trigger: footerCard,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            },
            yPercent: 14,
            ease: 'none'
          }
        );
      }

      // Staggered child elements reveal inside footer card (slower & clearly visible sequence)
      const footerChildren = footerCard.querySelectorAll('.footer-main-headline, .footer-email-link, .footer-divider-line, .footer-bottom-row');
      if (footerChildren.length) {
        gsap.fromTo(footerChildren,
          { opacity: 0, y: 45 },
          {
            scrollTrigger: {
              trigger: footerCard,
              start: 'top 80%',
              toggleActions: 'play reverse play reverse'
            },
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.16,
            ease: 'power2.out'
          }
        );
      }
    }
  }



  // =========================================================================
  // 8. MOVING FEATURE SECTION SCROLL-DRIVEN GRADIENT MORPH (UP & DOWN SCROLL)
  // =========================================================================
  function initFeatureScrollGradient() {
    const section = document.querySelector('.moving-feature-section');
    if (!section) return;

    const layerB = section.querySelector('.gradient-bg-layer.layer-b');
    const layerC = section.querySelector('.gradient-bg-layer.layer-c');
    const layerD = section.querySelector('.gradient-bg-layer.layer-d');

    if (!layerB || !layerC || !layerD) return;

    // Use GSAP ScrollTrigger for bidirectional scroll-linked gradient morphing
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.8,
        }
      });

      // Smoothly morph through the 4 rich dark gradients as user scrolls up and down
      tl.to(layerB, { opacity: 1, ease: 'none', duration: 1 })
        .to(layerC, { opacity: 1, ease: 'none', duration: 1 })
        .to(layerD, { opacity: 1, ease: 'none', duration: 1 });

      const waveOverlay = section.querySelector('.water-waves-overlay-layer');
      if (waveOverlay) {
        gsap.fromTo(waveOverlay,
          {
            yPercent: -12,
            scale: 1.02
          },
          {
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            },
            yPercent: 12,
            scale: 1.08,
            ease: 'none'
          }
        );
      }
    }
  }

  // ==========================================================================
  // 9. HERO INTERACTIVE WEBGL WATER RIPPLE EFFECT (OPTIMIZED HIGH PERFORMANCE)
  // ==========================================================================
  function initHeroWaterRipples() {
    if (typeof $ === 'undefined' || typeof $.fn.ripples !== 'function') return;

    try {
      const $slideBgs = $('.slide-bg');
      if (!$slideBgs.length) return;

      // Initialize WebGL ripples with efficient 256 resolution (4x faster, buttery smooth)
      $slideBgs.each(function () {
        const $el = $(this);
        try {
          $el.ripples({
            resolution: 256,
            dropRadius: 20,
            perturbance: 0.015,
            interactive: false
          });
          // Only the currently active slide should run its simulation
          if (!$el.closest('.slide-item').hasClass('active')) {
            $el.ripples('pause');
          }
        } catch (err) {
          console.warn('WebGL Ripples init error on slide:', err);
        }
      });

      // Pause WebGL rendering entirely when hero is scrolled out of viewport
      if ('IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const $activeBg = $('.slide-item.active .slide-bg');
            if ($activeBg.length && $activeBg.data('ripples')) {
              try {
                if (entry.isIntersecting) {
                  $activeBg.ripples('play');
                } else {
                  $activeBg.ripples('pause');
                }
              } catch (e) {}
            }
          });
        }, { threshold: 0.05 });

        const heroEl = document.querySelector('.hero-slider-section');
        if (heroEl) heroObserver.observe(heroEl);
      }

      // Smooth throttled mousemove interaction (avoids GPU flood & DOM reflows)
      const $heroSection = $('.hero-slider-section');
      let lastMoveTime = 0;
      let lastX = -999;
      let lastY = -999;

      $heroSection.on('mousemove', function (e) {
        const now = performance.now();
        if (now - lastMoveTime < 35) return; // Cap at ~28 drops/sec max

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (dx * dx + dy * dy < 36) return; // Ignore micro-jitters

        lastMoveTime = now;
        lastX = e.clientX;
        lastY = e.clientY;

        const $activeBg = $(this).find('.slide-item.active .slide-bg');
        if ($activeBg.length && $activeBg.data('ripples')) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          try {
            $activeBg.ripples('drop', x, y, 16, 0.015);
          } catch (err) {}
        }
      });

      // Click ripple splash effect
      $heroSection.on('click', function (e) {
        if ($(e.target).closest('a, button, .slider-controls, input').length) return;
        const $activeBg = $(this).find('.slide-item.active .slide-bg');
        if ($activeBg.length && $activeBg.data('ripples')) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          try {
            $activeBg.ripples('drop', x, y, 28, 0.035);
          } catch (err) {}
        }
      });

      // Debounced resize handler
      let resizeTimeout = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          $slideBgs.each(function () {
            if ($(this).data('ripples')) {
              try { $(this).ripples('updateSize'); } catch (err) {}
            }
          });
        }, 150);
      }, { passive: true });

    } catch (e) {
      console.warn('Hero Water Ripples initialization skipped:', e);
    }
  }

  // Initialize Hero Interactive Water Ripples
  initHeroWaterRipples();

  // Initialize Timer
  resetTimer();

  // ==========================================================================
  // BUENA VIDA ON-THEME QUICK BUY SHOP NOW MODAL CONTROLLER
  // ==========================================================================
  function initShopModal() {
    const modalBackdrop = document.getElementById('shopModal');
    if (!modalBackdrop) return;

    const closeBtn = document.getElementById('shopModalCloseBtn');
    const sizePills = document.querySelectorAll('.size-pill');
    const subtotalEl = document.getElementById('shopSubtotalPrice');
    const checkoutBtn = document.getElementById('shopCheckoutBtn');
    const bottleGlow = document.querySelector('.shop-bottle-glow');
    const bottleImg = document.getElementById('shopBottleImg');

    function openModal() {
      modalBackdrop.classList.add('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
    }

    function closeModal() {
      modalBackdrop.classList.remove('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }
    }

    // Close button click
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    // Click backdrop to close
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    // Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Delegated click listener for all Shop Now buttons & triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.js-shop-trigger, [data-shop-modal], a[href="#products"], a[href="#contact"], .hero-cta, .section-cta, .footer-nav-link');
      if (trigger) {
        const text = (trigger.textContent || '').trim().toLowerCase();
        if (text.includes('shop now') || text.includes('order buena vida') || text === 'shop' || trigger.classList.contains('js-shop-trigger')) {
          e.preventDefault();
          openModal();
        }
      }
    });

    // Capacity Size selector
    sizePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        sizePills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const price = parseFloat(pill.getAttribute('data-price') || '28.00').toFixed(2);
        if (subtotalEl) {
          subtotalEl.style.transform = 'scale(1.1)';
          subtotalEl.textContent = `$${price} USD`;
          setTimeout(() => {
            subtotalEl.style.transform = 'scale(1)';
          }, 150);
        }
      });
    });

    // Checkout Button feedback
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const originalText = checkoutBtn.innerHTML;
        checkoutBtn.classList.add('is-success');
        checkoutBtn.innerHTML = `✓ Proceeding to Secure Checkout...`;
        checkoutBtn.disabled = true;

        setTimeout(() => {
          checkoutBtn.classList.remove('is-success');
          checkoutBtn.innerHTML = originalText;
          checkoutBtn.disabled = false;
        }, 2200);
      });
    }
  }

  // Initialize Shop Now Modal
  initShopModal();
});
