/**
 * Finifacts - Advisora Theme Interactive Controller
 */

// 0. Finifacts Luxury Preloader Dismissal
(function initFinifactsPreloader() {
  const dismissPreloader = () => {
    const preloader = document.getElementById('finifactsPreloader');
    if (preloader && !preloader.classList.contains('loaded')) {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }
  };

  // When all assets and styles are ready
  if (document.readyState === 'complete') {
    setTimeout(dismissPreloader, 350);
  } else {
    window.addEventListener('load', () => {
      setTimeout(dismissPreloader, 350);
    });
  }

  // Safety fallback after 2s so user is never blocked
  setTimeout(dismissPreloader, 2000);
})();

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation (zero layout shift)
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('is-stuck', 'sticky');
      } else {
        siteHeader.classList.remove('is-stuck', 'sticky');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileClose = document.querySelector('.mobile-nav-close');
  const mobileBackdrop = document.querySelector('.mobile-backdrop');

  function openMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

  // 3. Pricing Switcher (Monthly / Yearly)
  const pricingSwitch = document.getElementById('pricingSwitch');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelYearly = document.getElementById('labelYearly');

  const priceElements = {
    starter: document.getElementById('priceStarter'),
    growth: document.getElementById('priceGrowth'),
    premium: document.getElementById('pricePremium')
  };

  const periodElements = document.querySelectorAll('.plan-period');

  const pricingData = {
    monthly: {
      starter: '$19.00',
      growth: '$89.00',
      premium: '$219.00',
      period: '/month'
    },
    yearly: {
      starter: '$180.00',
      growth: '$850.00',
      premium: '$2,100.00',
      period: '/year'
    }
  };

  let isYearly = false;

  function updatePricing(yearly) {
    isYearly = yearly;
    if (pricingSwitch) {
      if (yearly) {
        pricingSwitch.classList.add('yearly');
      } else {
        pricingSwitch.classList.remove('yearly');
      }
    }

    const currentData = yearly ? pricingData.yearly : pricingData.monthly;
    if (priceElements.starter) priceElements.starter.textContent = currentData.starter;
    if (priceElements.growth) priceElements.growth.textContent = currentData.growth;
    if (priceElements.premium) priceElements.premium.textContent = currentData.premium;

    periodElements.forEach(el => {
      el.textContent = currentData.period;
    });
  }

  if (pricingSwitch) {
    pricingSwitch.addEventListener('click', () => {
      updatePricing(!isYearly);
    });
  }
  if (labelMonthly) {
    labelMonthly.addEventListener('click', () => updatePricing(false));
  }
  if (labelYearly) {
    labelYearly.addEventListener('click', () => updatePricing(true));
  }

  // 4. Case Studies Slider (Autoplay every 4s, pause on hover/interaction)
  const casesSection = document.getElementById('cases');
  const caseCards = document.querySelectorAll('.case-slide-item');
  const caseDots = document.querySelectorAll('.case-dot');
  let currentCaseIndex = 0;
  let caseAutoPlayTimer = null;
  let isCaseHoveredOrInteracted = false;
  const AUTO_PLAY_INTERVAL = 4000;

  function showCaseSlide(index) {
    caseCards.forEach((card, i) => {
      if (i === index) {
        card.style.display = 'grid';
        card.style.opacity = '0';
        setTimeout(() => {
          card.style.transition = 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.opacity = '1';
        }, 20);
      } else {
        card.style.display = 'none';
      }
    });

    caseDots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    currentCaseIndex = index;
  }

  function nextCaseSlide() {
    if (caseCards.length === 0) return;
    const nextIndex = (currentCaseIndex + 1) % caseCards.length;
    showCaseSlide(nextIndex);
  }

  function prevCaseSlide() {
    if (caseCards.length === 0) return;
    const prevIndex = (currentCaseIndex - 1 + caseCards.length) % caseCards.length;
    showCaseSlide(prevIndex);
  }

  function startCaseAutoPlay() {
    stopCaseAutoPlay();
    if (!isCaseHoveredOrInteracted) {
      caseAutoPlayTimer = setInterval(nextCaseSlide, AUTO_PLAY_INTERVAL);
    }
  }

  function stopCaseAutoPlay() {
    if (caseAutoPlayTimer) {
      clearInterval(caseAutoPlayTimer);
      caseAutoPlayTimer = null;
    }
  }

  if (caseCards.length > 0) {
    showCaseSlide(0);
    startCaseAutoPlay();

    // Interaction: Clicking navigation dots
    caseDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showCaseSlide(i);
        startCaseAutoPlay();
      });
    });

    // Touch Swipe & Mouse Drag (move to next/prev on drag or swipe)
    if (casesSection) {
      let dragStartX = 0;
      let dragStartY = 0;
      let dragDiffX = 0;
      let dragDiffY = 0;
      let isDragging = false;
      const SWIPE_THRESHOLD = 45;

      const handleDragStart = (x, y) => {
        dragStartX = x;
        dragStartY = y;
        dragDiffX = 0;
        dragDiffY = 0;
        isDragging = true;
        isCaseHoveredOrInteracted = true;
        stopCaseAutoPlay();
      };

      const handleDragMove = (x, y) => {
        if (!isDragging) return;
        dragDiffX = x - dragStartX;
        dragDiffY = y - dragStartY;
      };

      const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (casesSection) {
          casesSection.style.cursor = '';
        }

        // Horizontal swipe triggered
        if (Math.abs(dragDiffX) > SWIPE_THRESHOLD && Math.abs(dragDiffX) > Math.abs(dragDiffY)) {
          if (dragDiffX < 0) {
            nextCaseSlide();
          } else {
            prevCaseSlide();
          }
        }

        setTimeout(() => {
          isCaseHoveredOrInteracted = false;
          startCaseAutoPlay();
        }, 1500);
      };

      // Touch events (Mobile / Tablet)
      casesSection.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      casesSection.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      casesSection.addEventListener('touchend', () => {
        handleDragEnd();
      }, { passive: true });

      // Mouse drag events (Desktop)
      casesSection.addEventListener('mousedown', (e) => {
        if (e.target.closest('a, button')) return;
        handleDragStart(e.clientX, e.clientY);
        casesSection.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
          handleDragMove(e.clientX, e.clientY);
        }
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          handleDragEnd();
        }
      });

      // Pause on hover
      casesSection.addEventListener('mouseenter', () => {
        isCaseHoveredOrInteracted = true;
        stopCaseAutoPlay();
      });

      casesSection.addEventListener('mouseleave', () => {
        if (!isDragging) {
          isCaseHoveredOrInteracted = false;
          startCaseAutoPlay();
        }
      });

      // Accessibility: Pause when focused via keyboard
      casesSection.addEventListener('focusin', () => {
        isCaseHoveredOrInteracted = true;
        stopCaseAutoPlay();
      });

      casesSection.addEventListener('focusout', () => {
        isCaseHoveredOrInteracted = false;
        startCaseAutoPlay();
      });
    }

    // Pause when tab is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopCaseAutoPlay();
      } else if (!isCaseHoveredOrInteracted) {
        startCaseAutoPlay();
      }
    });
  }

  // 5. Back to Top Button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 6. Funfact Counter Animation
  const counters = document.querySelectorAll('.counter-val');
  let countersStarted = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      let count = 0;
      const speed = target > 100 ? target / 50 : 1;

      const updateCount = () => {
        count += speed;
        if (count < target) {
          counter.textContent = Math.floor(count) + suffix;
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target + suffix;
        }
      };
      updateCount();
    });
  }

  const funfactsSection = document.querySelector('.funfacts-section');
  if (funfactsSection && counters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        runCounters();
      }
    }, { threshold: 0.3 });
    observer.observe(funfactsSection);
  }

  // 7. AJAX Contact Form Submission
  const contactForm = document.getElementById('finifactsContactForm');
  const formResponse = document.getElementById('finifactsFormResponse');
  const submitBtn = document.getElementById('finifactsSubmitBtn');

  if (contactForm && typeof finifacts_ajax !== 'undefined') {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      formData.append('action', 'finifacts_submit_contact');
      formData.append('nonce', finifacts_ajax.nonce);

      if (submitBtn) {
        submitBtn.disabled = true;
        const spanEl = submitBtn.querySelector('span');
        if (spanEl) spanEl.textContent = 'Sending...';
      }

      fetch(finifacts_ajax.ajax_url, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (formResponse) {
          formResponse.style.display = 'block';
          if (data && data.success) {
            formResponse.style.backgroundColor = '#e0f2f1';
            formResponse.style.color = '#00796b';
            formResponse.style.border = '1px solid #b2dfdb';
            formResponse.textContent = data.data.message;
            contactForm.reset();
          } else {
            formResponse.style.backgroundColor = '#ffebee';
            formResponse.style.color = '#c62828';
            formResponse.style.border = '1px solid #ffcdd2';
            formResponse.textContent = (data && data.data && data.data.message) ? data.data.message : 'An error occurred. Please try again.';
          }
        }
      })
      .catch(() => {
        if (formResponse) {
          formResponse.style.display = 'block';
          formResponse.style.backgroundColor = '#ffebee';
          formResponse.style.color = '#c62828';
          formResponse.style.border = '1px solid #ffcdd2';
          formResponse.textContent = 'Server connection error. Please try again or contact us directly.';
        }
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          const spanEl = submitBtn.querySelector('span');
          if (spanEl) spanEl.textContent = 'Submit Inquiry';
        }
      });
    });
  }

  // 8. AJAX Newsletter Subscription
  const newsletterForm = document.getElementById('finifactsNewsletterForm');
  const newsletterMsg = document.getElementById('finifactsNewsletterMsg');

  if (newsletterForm && typeof finifacts_ajax !== 'undefined') {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[name="email"]');
      if (!emailInput || !emailInput.value) return;

      const formData = new FormData();
      formData.append('action', 'finifacts_submit_newsletter');
      formData.append('nonce', finifacts_ajax.nonce);
      formData.append('email', emailInput.value);

      fetch(finifacts_ajax.ajax_url, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (newsletterMsg) {
          newsletterMsg.style.display = 'block';
          if (data && data.success) {
            newsletterMsg.style.color = '#00b4a0';
            newsletterMsg.textContent = data.data.message;
            newsletterForm.reset();
          } else {
            newsletterMsg.style.color = '#ff6b6b';
            newsletterMsg.textContent = (data && data.data && data.data.message) ? data.data.message : 'Subscription error. Please try again.';
          }
        }
      })
      .catch(() => {
        if (newsletterMsg) {
          newsletterMsg.style.display = 'block';
          newsletterMsg.style.color = '#ff6b6b';
          newsletterMsg.textContent = 'Could not subscribe. Please try again.';
        }
      });
    });
  }
});

