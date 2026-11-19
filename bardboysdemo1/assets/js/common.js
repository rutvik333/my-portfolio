/**
 * BARD BOYS OXNARD - COMMON JAVASCRIPT
 * Shared state, 21+ Age Gate, Cart Drawer, Store Hours, and Accessibility
 */

(function () {
  'use strict';

  // --- Cart State ---
  const cart = {
    items: [
      { id: 'bb-1', title: 'Top-Shelf Gelato 41 (3.5g)', category: 'Flower', price: 45.00, qty: 1, tag: 'Indica • 31% THC' },
      { id: 'bb-2', title: 'Live Rosin Disposable (1g)', category: 'Vapes', price: 55.00, qty: 1, tag: 'Hybrid • 84% THC' }
    ],

    init() {
      const saved = localStorage.getItem('bardboys_cart');
      if (saved) {
        try {
          this.items = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      this.render();
    },

    save() {
      localStorage.setItem('bardboys_cart', JSON.stringify(this.items));
      this.render();
    },

    addItem(item) {
      const existing = this.items.find(i => i.id === item.id);
      if (existing) {
        existing.qty += 1;
      } else {
        this.items.push({ ...item, qty: 1 });
      }
      this.save();
      window.showToast('Item Added to Bag', `${item.title} added successfully.`);
      this.openDrawer();
    },

    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.save();
    },

    updateQty(id, delta) {
      const item = this.items.find(i => i.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        this.removeItem(id);
      } else {
        this.save();
      }
    },

    getTotal() {
      return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    getCount() {
      return this.items.reduce((sum, item) => sum + item.qty, 0);
    },

    render() {
      // Update badge counts
      const count = this.getCount();
      document.querySelectorAll('.cart-count-badge, .js-cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
      });

      // Update cart drawer body
      const bodyEl = document.getElementById('cartDrawerBody');
      const subtotalEl = document.getElementById('cartSubtotal');
      const taxEl = document.getElementById('cartEstimatedTax');
      const totalEl = document.getElementById('cartTotal');

      if (!bodyEl) return;

      if (this.items.length === 0) {
        bodyEl.innerHTML = `
          <div class="cart-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px auto; opacity: 0.5;">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <p>Your bag is empty.</p>
            <span style="font-size: 13px; color: #94a3b8; display: block; margin-top: 6px;">Add items to begin order for pickup or delivery.</span>
          </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (taxEl) taxEl.textContent = '$0.00';
        if (totalEl) totalEl.textContent = '$0.00';
        return;
      }

      bodyEl.innerHTML = this.items.map(item => `
        <div class="cart-item">
          <div class="cart-item-thumb">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06833D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C6.5 7.5 4 14 6 18c2 4 8.5 4 12 0 3.5-4 1-10.5-6-16z"/>
              <path d="M12 8v10M8 12l4 3 4-3"/>
            </svg>
          </div>
          <div class="cart-item-info">
            <div class="cart-item-tag">${item.tag || item.category}</div>
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="window.cart.updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="window.cart.updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>
      `).join('');

      const subtotal = this.getTotal();
      const tax = subtotal * 0.15; // CA approx cannabis excise + sales
      const total = subtotal + tax;

      if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
      if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    },

    openDrawer() {
      const drawer = document.getElementById('cartDrawer');
      const overlay = document.getElementById('cartDrawerOverlay');
      if (drawer) drawer.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('modal-open');
    },

    closeDrawer() {
      const drawer = document.getElementById('cartDrawer');
      const overlay = document.getElementById('cartDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  };

  window.cart = cart;

  // --- Toast Notifications ---
  window.showToast = function (title, message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div>
        <div style="font-weight: 700; font-size: 13px;">${title}</div>
        <div style="font-size: 12px; opacity: 0.85;">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  };

  // --- 21+ Age Gate Modal ---
  function initAgeGate() {
    const overlay = document.getElementById('ageGateOverlay');
    if (!overlay) return;

    const isVerified = localStorage.getItem('bardboys_age_verified') === 'true';
    if (isVerified) {
      overlay.classList.add('hidden');
      return;
    }

    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');

    const verifyBtn = document.getElementById('btnAgeVerify');
    const denyBtn = document.getElementById('btnAgeDeny');
    const rememberCheckbox = document.getElementById('ageRemember');

    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        if (!rememberCheckbox || rememberCheckbox.checked) {
          localStorage.setItem('bardboys_age_verified', 'true');
        }
        overlay.classList.add('hidden');
        document.body.classList.remove('modal-open');
        window.showToast('Welcome to Bard Boys', 'Age verified: 21+ California Compliant');
      });
    }

    if (denyBtn) {
      denyBtn.addEventListener('click', () => {
        alert('You must be 21 or older to view the Bard Boys Oxnard menu. Redirecting...');
        window.location.href = 'https://www.google.com';
      });
    }
  }

  // --- Live Store Hours Status ---
  function initStoreHours() {
    const statusBadges = document.querySelectorAll('.js-store-status');
    if (!statusBadges.length) return;

    // California time check (PST/PDT): Open daily 9am - 10pm
    const now = new Date();
    // Convert to California time
    const caTimeStr = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const caDate = new Date(caTimeStr);
    const hour = caDate.getHours();

    const isOpen = hour >= 9 && hour < 22;

    statusBadges.forEach(badge => {
      if (isOpen) {
        badge.innerHTML = `<span class="status-dot"></span> Open Now • Closes 10:00 PM PST`;
        badge.style.color = '#10b981';
      } else {
        badge.innerHTML = `<span class="status-dot" style="background:#f59e0b;"></span> Opens 9:00 AM PST • Delivery Pre-Orders Open`;
        badge.style.color = '#f59e0b';
      }
    });
  }

  // --- Mobile Navigation ---
  function initMobileNav() {
    const burger = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileNavOverlay');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('active');
      burger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('modal-open', isOpen);
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        document.body.classList.remove('modal-open');
      });
    });
  }

  // --- Checkout simulation via Meadow POS ---
  window.proceedToMeadowCheckout = function () {
    const count = cart.getCount();
    if (count === 0) {
      alert('Your bag is currently empty. Please select products from our Oxnard menu.');
      return;
    }
    const total = (cart.getTotal() * 1.15).toFixed(2);
    alert(`Order ready for transfer to Meadow POS & Oxnard Fulfillment!\n\nSubtotal + Tax: $${total}\nPickup Address: 2550 E Vineyard Ave, Oxnard CA\n\nDirecting to Meadow Express Checkout...`);
    window.open('https://www.bardboysox.com/shop', '_blank');
  };

  // --- DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    cart.init();
    initAgeGate();
    initStoreHours();
    initMobileNav();

    // Attach cart open/close listeners
    document.querySelectorAll('.js-open-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        cart.openDrawer();
      });
    });

    const closeCartBtn = document.getElementById('btnCloseCart');
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => cart.closeDrawer());

    const cartOverlay = document.getElementById('cartDrawerOverlay');
    if (cartOverlay) cartOverlay.addEventListener('click', () => cart.closeDrawer());

    // ESC key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cart.closeDrawer();
      }
    });
  });
})();
