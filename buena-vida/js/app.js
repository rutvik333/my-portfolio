/**
 * Buena Vida — Continuous Parallax & Product Scroll Engine
 * Powered by GSAP & ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initContinuousParallax();
  } else {
    console.warn('GSAP or ScrollTrigger not loaded');
  }

  initNavigation();
  initOrderModal();
  initSpecsPicker();
  initAmbientAudio();
});

/* ==========================================================================
   GSAP Continuous Master Scroll Orchestration
   Single unified master timeline for 100% fluid, unbroken bottle movement
   ========================================================================== */
function initContinuousParallax() {
  const isMobile = () => window.innerWidth <= 960;

  // Initial setup: Bottle starts completely INVISIBLE on initial load!
  gsap.set('#bottle-wrapper', {
    opacity: 0,
    scale: 0.7,
    y: 80,
    x: 0,
    rotation: -22
  });

  // Dynamic navbar styling when scrolled past top hero area
  ScrollTrigger.create({
    trigger: '#hero-section',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      const nav = document.getElementById('main-nav');
      if (nav) {
        if (self.scroll() > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    }
  });

  // Single Master Timeline for unbroken, continuous, fluid movement (scrub: 0.3 for instant response)
  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#page-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3, // Fast, crisp, lag-free scroll response
      invalidateOnRefresh: true
    }
  });

  /* -------------------------------------------------------------
     1. CONTINUOUS PANORAMIC BACKGROUND SCROLL
     Pans background image continuously from canopy top to mossy bottom
     ------------------------------------------------------------- */
  masterTl.to('#panoramic-bg', {
    yPercent: -45,
    ease: 'none',
    duration: 10
  }, 0);

  /* -------------------------------------------------------------
     2. HERO SECTION SCROLL (0.0 -> 0.8)
     - Load (scroll = 0): Hero text visible ("Hydration, Anytime, Anywhere"). Bottle is opacity: 0 (NO text overlap!).
     - Scrolling down: Hero text slides up & fades out.
     ------------------------------------------------------------- */
  masterTl.to('#hero-content', {
    opacity: 0,
    y: -80,
    scale: 0.92,
    duration: 0.8,
    ease: 'power2.inOut'
  }, 0.1);

  masterTl.to('#scroll-indicator', {
    opacity: 0,
    duration: 0.5,
    ease: 'power1.out'
  }, 0.05);

  /* -------------------------------------------------------------
     3. DEDICATED 100VH PRODUCT SOLO SHOWCASE (0.8 -> 1.8)
     - Centered bottle cutout fades in floating alone in 100vh waterfall mist
     ------------------------------------------------------------- */
  masterTl.to('#bottle-wrapper', {
    opacity: 1,
    scale: 0.95,
    y: 0,
    rotation: -16,
    x: 0,
    duration: 1.0,
    ease: 'power2.out'
  }, 0.4);

  /* -------------------------------------------------------------
     4. SECTION 2: ELEVATE YOUR HYDRATION GAME (1.8 -> 4.0)
     - Forwarded timing: Bottle moves IMMEDIATELY to the RIGHT side of text content as section arrives!
     ------------------------------------------------------------- */
  masterTl.to('#bottle-wrapper', {
    rotation: 0,
    x: () => (isMobile() ? 0 : window.innerWidth * 0.28),
    y: () => (isMobile() ? -window.innerHeight * 0.12 : 0),
    scale: () => (isMobile() ? 0.72 : 1.02),
    opacity: 1,
    duration: 2.0,
    ease: 'power2.inOut'
  }, 1.8);

  /* -------------------------------------------------------------
     5. SECTION 3: BORN HIGH IN THE ALPINE MIST (4.0 -> 6.2)
     - Forwarded timing: Bottle glides IMMEDIATELY to LEFT side floating cleanly OUTSIDE the cards grid!
     ------------------------------------------------------------- */
  masterTl.to('#bottle-wrapper', {
    rotation: 10,
    x: () => (isMobile() ? 0 : -window.innerWidth * 0.30),
    y: () => 0,
    scale: () => (isMobile() ? 0.65 : 0.88),
    opacity: () => (isMobile() ? 0.2 : 1),
    duration: 2.0,
    ease: 'power2.inOut'
  }, 4.0);

  /* -------------------------------------------------------------
     6. SECTION 4: ENGINEERED FOR THE JOURNEY (6.2 -> 7.8)
     - Bottle glides into Section 4 on the RIGHT side as its FINAL DESTINATION!
     ------------------------------------------------------------- */
  masterTl.to('#bottle-wrapper', {
    rotation: 0,
    x: () => (isMobile() ? 0 : window.innerWidth * 0.26),
    y: () => (isMobile() ? 0 : window.innerHeight * 0.02),
    scale: () => (isMobile() ? 0.70 : 0.96),
    opacity: 1,
    duration: 1.6,
    ease: 'power2.inOut'
  }, 6.2);

  /* -------------------------------------------------------------
     7. STAY DOCKED IN SECTION 4 AS IT SCROLLS OFF SCREEN (7.8 -> 10.0)
     - Bottle remains 100% visible (opacity: 1) and scrolls up naturally with Section 4
     - It stays permanently docked in Section 4 as its final destination!
     ------------------------------------------------------------- */
  masterTl.to('#bottle-wrapper', {
    y: () => (isMobile() ? -window.innerHeight * 0.75 : -window.innerHeight * 0.90),
    opacity: 1,
    duration: 2.2,
    ease: 'none'
  }, 7.8);

  // Smooth scroll indicator click
  const scrollIndicator = document.getElementById('scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const targetSec = document.getElementById('product-solo-section');
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Specifications scroll link
  const specScrollBtn = document.getElementById('spec-scroll-btn');
  if (specScrollBtn) {
    specScrollBtn.addEventListener('click', () => {
      const target = document.getElementById('specs-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* ==========================================================================
   Navigation & Slide-out Drawer
   ========================================================================== */
function initNavigation() {
  const menuToggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('nav-drawer');
  const overlay = document.getElementById('nav-drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');
  const links = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      closeDrawer();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/* ==========================================================================
   Interactive Order Modal & Dynamic Pricing
   ========================================================================== */
function initOrderModal() {
  const modal = document.getElementById('order-modal');
  const backdrop = document.getElementById('order-modal-backdrop');
  const closeBtn = document.getElementById('order-modal-close');
  const orderButtons = document.querySelectorAll(
    '#nav-order-btn, #hero-order-btn, #showcase-order-btn, #specs-order-btn, #eco-order-btn, .order-trigger'
  );
  const checkoutBtn = document.getElementById('checkout-btn');
  const modalSubtotal = document.getElementById('modal-subtotal');
  const sizeButtons = document.querySelectorAll('.m-size-btn');
  const colorDots = document.querySelectorAll('.color-dot');

  let currentPrice = 28;

  function openModal() {
    modal.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  orderButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  // Size Selector in Modal
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPrice = parseInt(btn.dataset.price, 10);
      if (modalSubtotal) modalSubtotal.textContent = `$${currentPrice}.00 USD`;
    });
  });

  // Color Selector in Modal
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Checkout trigger
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const activeSize = document.querySelector('.m-size-btn.active')?.dataset.mSize || '500ml';
      checkoutBtn.innerHTML = '<span>Processing Order...</span>';
      setTimeout(() => {
        alert(`Thank you for your order!\n\nProduct: Buena Vida Pure Bottle (${activeSize})\nTotal: $${currentPrice}.00 USD\nShipping: Expedited (Free)\n\nA confirmation has been sent.`);
        checkoutBtn.innerHTML = 'Proceed to Checkout &bull; Free Shipping';
        closeModal();
      }, 700);
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

/* ==========================================================================
   Specs Section Size Picker
   ========================================================================== */
function initSpecsPicker() {
  const sizeBtns = document.querySelectorAll('.size-options .size-btn');
  const capacityLabel = document.getElementById('spec-capacity-val');
  const priceDisplay = document.getElementById('dynamic-price');

  const specsMap = {
    '500ml': { cap: '500 ml / 16.9 fl oz', price: '$28.00' },
    '750ml': { cap: '750 ml / 25.4 fl oz', price: '$34.00' },
    '1000ml': { cap: '1,000 ml / 33.8 fl oz', price: '$39.00' }
  };

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sizeKey = btn.dataset.size;
      if (specsMap[sizeKey]) {
        if (capacityLabel) capacityLabel.textContent = specsMap[sizeKey].cap;
        if (priceDisplay) priceDisplay.textContent = specsMap[sizeKey].price;
      }
    });
  });
}

/* ==========================================================================
   Ambient Nature Waterfall Sound Synthesizer (Web Audio API)
   ========================================================================== */
function initAmbientAudio() {
  const audioBtn = document.getElementById('audio-toggle');
  if (!audioBtn) return;

  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;
  let isPlaying = false;

  function toggleAudio() {
    if (!isPlaying) {
      startAmbientAudio();
    } else {
      stopAmbientAudio();
    }
  }

  function startAmbientAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Generate pink/waterfall noise buffer
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      // Filter to shape sound into soothing waterfall mist & mountain stream
      const lowpass = audioCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(650, audioCtx.currentTime);

      const highpass = audioCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(120, audioCtx.currentTime);

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 1.5);

      noiseNode.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      noiseNode.start(0);
      isPlaying = true;
      audioBtn.classList.add('playing');
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  }

  function stopAmbientAudio() {
    if (gainNode && audioCtx) {
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      setTimeout(() => {
        if (noiseNode) {
          noiseNode.stop();
          noiseNode.disconnect();
        }
        isPlaying = false;
        audioBtn.classList.remove('playing');
      }, 850);
    } else {
      isPlaying = false;
      audioBtn.classList.remove('playing');
    }
  }

  audioBtn.addEventListener('click', toggleAudio);
}
