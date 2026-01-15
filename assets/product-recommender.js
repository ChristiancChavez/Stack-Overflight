class ProductRecommender extends HTMLElement {
  constructor() {
    super();
    this.currentStep = 1;
    this.selections = {
      tripType: null,
      costRange: null,
      coverageLevel: null
    };
    this.sectionId = this.id.replace('product-recommender-', '');
    /** @type {Array<{settings?: {trip_type?: string, cost_range?: string, coverage_level?: string, product?: string, variant_id?: string, override_title?: string, override_copy?: string, override_price?: string}}>} */
    this.mappings = [];
    /** @type {Array<{settings?: {benefit_text?: string, icon_type?: string, icon_name?: string, benefit_image?: string}}>} */
    this.benefits = [];
    /** @type {any} */
    this.currentProduct = null;
    /** @type {any} */
    this.currentVariant = null;
  }

  connectedCallback() {
    this.loadMappings();
    this.loadBenefits();
    this.initializeSelectors();
    this.initializeCTA();
    this.updateProgress();
  }

  /**
   * Load product mappings from data attribute
   */
  loadMappings() {
    try {
      const mappingsData = this.dataset.mappings;
      if (mappingsData) {
        this.mappings = JSON.parse(mappingsData);
      }
    } catch (e) {
      console.error('Error parsing mappings:', e);
      this.mappings = [];
    }
  }

  /**
   * Load benefits from data attribute
   */
  loadBenefits() {
    try {
      const benefitsData = this.dataset.benefits;
      if (benefitsData) {
        this.benefits = JSON.parse(benefitsData);
      }
    } catch (e) {
      console.error('Error parsing benefits:', e);
      this.benefits = [];
    }
  }

  /**
   * Initialize selector buttons and event listeners
   */
  initializeSelectors() {
    const optionCards = this.querySelectorAll('.product-recommender__option-card');
    
    optionCards.forEach(card => {
      const htmlCard = /** @type {HTMLElement} */ (card);
      htmlCard.addEventListener('click', (e) => {
        const step = parseInt(htmlCard.dataset.step || '0');
        const value = htmlCard.dataset.value || '';
        
        this.handleSelection(step, value, htmlCard);
      });
    });
  }

  /**
   * Handle user selection
   * @param {number} step - The step number (1, 2, or 3)
   * @param {string} value - The selected value
   * @param {HTMLElement} card - The clicked card element
   */
  handleSelection(step, value, card) {
    // Update selection state
    switch(step) {
      case 1:
        /** @type {string | null} */ (this.selections.tripType) = value;
        break;
      case 2:
        /** @type {string | null} */ (this.selections.costRange) = value;
        break;
      case 3:
        /** @type {string | null} */ (this.selections.coverageLevel) = value;
        break;
    }

    // Update UI
    this.updateSelectedCard(step, card);
    this.advanceStep(step);
    this.updateProgress();
  }

  /**
   * Update the selected card appearance
   * @param {number} step - The step number
   * @param {HTMLElement} selectedCard - The selected card element
   */
  updateSelectedCard(step, selectedCard) {
    // Remove selection from all cards in this step
    const stepCards = this.querySelectorAll(`[data-step="${step}"]`);
    stepCards.forEach(card => {
      card.removeAttribute('data-selected');
    });

    // Add selection to clicked card
    selectedCard.setAttribute('data-selected', 'true');
  }

  /**
   * Advance to the next step
   * @param {number} currentStep - The current step number
   */
  advanceStep(currentStep) {
    // Hide current step
    const currentStepElement = this.querySelector(`.product-recommender__step[data-step="${currentStep}"]`);
    if (currentStepElement) {
      currentStepElement.classList.add('product-recommender__step--hidden');
    }

    // Show next step if available
    if (currentStep < 3) {
      this.currentStep = currentStep + 1;
      const nextStepElement = this.querySelector(`.product-recommender__step[data-step="${this.currentStep}"]`);
      if (nextStepElement) {
        nextStepElement.classList.remove('product-recommender__step--hidden');
        
        // Scroll to top of selector for better UX
        nextStepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      // All steps completed, trigger product recommendation
      this.onAllStepsComplete();
    }
  }

  /**
   * Update progress indicator
   */
  updateProgress() {
    const progressSteps = this.querySelectorAll('.product-recommender__progress-step');
    const progressFill = /** @type {HTMLElement | null} */ (this.querySelector('.product-recommender__progress-fill'));
    
    if (!progressSteps.length || !progressFill) return;

    // Update step states
    progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      const stepElement = /** @type {HTMLElement} */ (step);
      
      if (stepNumber < this.currentStep) {
        stepElement.setAttribute('data-completed', 'true');
        stepElement.removeAttribute('data-active');
      } else if (stepNumber === this.currentStep) {
        stepElement.setAttribute('data-active', 'true');
        stepElement.removeAttribute('data-completed');
      } else {
        stepElement.removeAttribute('data-active');
        stepElement.removeAttribute('data-completed');
      }
    });

    // Update progress bar
    const progressPercentage = ((this.currentStep - 1) / 3) * 100;
    progressFill.style.width = `${progressPercentage}%`;
  }

  /**
   * Called when all steps are completed
   */
  async onAllStepsComplete() {
    const matchingMapping = this.findMatchingProduct();
    
    if (matchingMapping && matchingMapping.settings && matchingMapping.settings.product) {
      await this.loadProductData(matchingMapping);
      this.displayProduct(matchingMapping);
    } else {
      console.warn('No matching product found for selections:', this.selections);
    }
  }

  /**
   * Find matching product based on selections
   * @returns {{settings?: {trip_type?: string, cost_range?: string, coverage_level?: string, product?: string, variant_id?: string, override_title?: string, override_copy?: string, override_price?: string}} | null} Matching product mapping or null
   */
  findMatchingProduct() {
    // Try exact match first
    for (const mapping of this.mappings) {
      if (!mapping || !mapping.settings) continue;
      
      const matchesTripType = mapping.settings.trip_type === this.selections.tripType;
      const matchesCostRange = mapping.settings.cost_range === this.selections.costRange;
      const matchesCoverage = mapping.settings.coverage_level === this.selections.coverageLevel;
      
      if (matchesTripType && matchesCostRange && matchesCoverage) {
        return mapping;
      }
    }

    // Try partial matches (priority: coverage > trip type > cost range)
    for (const mapping of this.mappings) {
      if (!mapping || !mapping.settings) continue;
      
      const matchesCoverage = mapping.settings.coverage_level === this.selections.coverageLevel;
      const matchesTripType = mapping.settings.trip_type === this.selections.tripType;
      
      if (matchesCoverage && matchesTripType) {
        return mapping;
      }
    }

    for (const mapping of this.mappings) {
      if (!mapping || !mapping.settings) continue;
      
      if (mapping.settings.coverage_level === this.selections.coverageLevel) {
        return mapping;
      }
    }

    // Return first mapping as fallback
    return this.mappings.length > 0 ? (this.mappings[0] || null) : null;
  }

  /**
   * Load product data from Shopify
   * @param {{settings?: {trip_type?: string, cost_range?: string, coverage_level?: string, product?: string, variant_id?: string, override_title?: string, override_copy?: string, override_price?: string}}} mapping - The product mapping object
   */
  async loadProductData(mapping) {
    if (!mapping || !mapping.settings || !mapping.settings.product) return;

    try {
      const productHandle = mapping.settings.product.split('/').pop();
      const response = await fetch(`/products/${productHandle}.js`);
      
      if (!response.ok) {
        throw new Error(`Failed to load product: ${response.status}`);
      }

      this.currentProduct = await response.json();
      
      // Find variant if specified
      if (mapping.settings.variant_id) {
        const variantId = parseInt(mapping.settings.variant_id);
        this.currentVariant = this.currentProduct.variants.find(/** @param {any} v */ (v) => v.id === variantId);
      }
      
      // Use first available variant if no variant specified
      if (!this.currentVariant) {
        this.currentVariant = this.currentProduct.variants.find(/** @param {any} v */ (v) => v.available) || this.currentProduct.variants[0];
      }
    } catch (error) {
      console.error('Error loading product data:', error);
      this.currentProduct = null;
      this.currentVariant = null;
    }
  }

  /**
   * Display the recommended product
   * @param {{settings?: {trip_type?: string, cost_range?: string, coverage_level?: string, product?: string, variant_id?: string, override_title?: string, override_copy?: string, override_price?: string}}} mapping - The product mapping object
   */
  displayProduct(mapping) {
    if (!this.currentProduct || !this.currentVariant || !mapping || !mapping.settings) {
      console.error('Product data not loaded');
      return;
    }

    const resultContainer = this.querySelector('.product-recommender__result');
    if (!resultContainer) return;

    // Hide selector, show result
    const selector = this.querySelector('.product-recommender__selector');
    if (selector) {
      selector.classList.add('product-recommender__step--hidden');
    }
    resultContainer.classList.remove('product-recommender__result--hidden');

    // Update product image
    const imageElement = /** @type {HTMLImageElement | null} */ (resultContainer.querySelector('.product-recommender__product-image'));
    if (imageElement) {
      const imageUrl = this.currentVariant.featured_image || this.currentProduct.featured_image;
      if (imageUrl) {
        imageElement.src = imageUrl;
        imageElement.alt = this.currentProduct.title;
      }
    }

    // Update product title
    const titleElement = resultContainer.querySelector('.product-recommender__product-title');
    if (titleElement) {
      titleElement.textContent = mapping.settings.override_title || this.currentProduct.title;
    }

    // Update product copy
    const copyElement = resultContainer.querySelector('.product-recommender__product-copy');
    if (copyElement) {
      copyElement.textContent = mapping.settings.override_copy || this.currentProduct.description || '';
    }

    // Update product price
    const priceElement = resultContainer.querySelector('.product-recommender__product-price');
    if (priceElement) {
      if (mapping.settings.override_price) {
        priceElement.textContent = mapping.settings.override_price;
      } else {
        const price = (this.currentVariant.price / 100).toFixed(2);
        priceElement.textContent = `€${price}`;
      }
    }

    // Update benefits
    const benefitsList = resultContainer.querySelector('.product-recommender__product-benefits');
    if (benefitsList) {
      benefitsList.innerHTML = '';
      this.benefits.forEach(benefit => {
        if (benefit && benefit.settings && benefit.settings.benefit_text) {
          const li = document.createElement('li');
          li.textContent = benefit.settings.benefit_text;
          benefitsList.appendChild(li);
        }
      });
    }

    // Store product data for CTA
    const ctaButton = /** @type {HTMLElement | null} */ (resultContainer.querySelector('.product-recommender__cta-button'));
    if (ctaButton) {
      ctaButton.dataset.productId = String(this.currentProduct.id);
      ctaButton.dataset.variantId = String(this.currentVariant.id);
      ctaButton.dataset.productHandle = this.currentProduct.handle;
    }

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Initialize CTA button
   */
  initializeCTA() {
    const ctaButton = /** @type {HTMLElement | null} */ (this.querySelector('.product-recommender__cta-button'));
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        this.handleCTAClick(ctaButton);
      });
    }
  }

  /**
   * Handle CTA button click
   * @param {HTMLElement} button - The CTA button element
   */
  async handleCTAClick(button) {
    const ctaType = button.dataset.ctaType || 'add_to_cart';
    
    if (ctaType === 'add_to_cart') {
      await this.addToCart(button);
    } else {
      // Navigate to product page
      const productHandle = button.dataset.productHandle;
      if (productHandle) {
        window.location.href = `/products/${productHandle}`;
      }
    }
  }

  /**
   * Add product to cart
   * @param {HTMLElement} button - The CTA button element
   */
  async addToCart(button) {
    const variantId = button.dataset.variantId;
    if (!variantId) {
      console.error('Variant ID not found');
      return;
    }

    // Disable button and show loading state
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding...';

    try {
      // Create form data
      const formData = new FormData();
      formData.append('id', variantId);
      formData.append('quantity', '1');
      formData.append('sections', this.sectionId);

      // Use fetchConfig from utilities if available, otherwise use basic config
      let fetchCfg;
      if (typeof window.fetchConfig === 'function') {
        fetchCfg = window.fetchConfig('javascript', { body: formData });
      } else {
        fetchCfg = {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        };
      }

      const response = await fetch(Theme.routes.cart_add_url, {
        ...fetchCfg,
        headers: {
          ...fetchCfg.headers,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (data.status) {
        // Error occurred
        console.error('Add to cart error:', data.message);
        this.showErrorMessage(button, data.message || 'Failed to add product to cart');
        button.disabled = false;
        button.textContent = originalText;
      } else {
        // Success
        button.textContent = 'Added to Cart!';
        
        // Dispatch cart add event for other components
        document.dispatchEvent(
          new CustomEvent('cart:add', {
            detail: {
              items: data.items || [],
              sections: data.sections || {}
            },
            bubbles: true
          })
        );

        // Reset button after delay
        setTimeout(() => {
          button.disabled = false;
          button.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showErrorMessage(button, 'An error occurred. Please try again.');
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  /**
   * Show error message
   * @param {HTMLElement} button - The button element
   * @param {string} message - Error message
   */
  showErrorMessage(button, message) {
    // Create or get error message element
    let errorElement = this.querySelector('.product-recommender__error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'product-recommender__error-message';
      errorElement.setAttribute('role', 'alert');
      button.parentElement?.insertBefore(errorElement, button);
    }
    
    errorElement.textContent = message;
    errorElement.classList.remove('product-recommender__error-message--hidden');

    // Hide error after delay
    setTimeout(() => {
      errorElement?.classList.add('product-recommender__error-message--hidden');
    }, 5000);
  }

  /**
   * Reset the selector to initial state
   */
  reset() {
    this.currentStep = 1;
    this.selections = {
      tripType: null,
      costRange: null,
      coverageLevel: null
    };

    // Reset all steps visibility
    const allSteps = this.querySelectorAll('.product-recommender__step');
    allSteps.forEach((step, index) => {
      if (index === 0) {
        step.classList.remove('product-recommender__step--hidden');
      } else {
        step.classList.add('product-recommender__step--hidden');
      }
    });

    // Reset selected cards
    const allCards = this.querySelectorAll('.product-recommender__option-card');
    allCards.forEach(card => {
      card.removeAttribute('data-selected');
    });

    // Reset progress
    this.updateProgress();
  }

  /**
   * Get current selections
   * @returns {Object} Current selections object
   */
  getSelections() {
    return { ...this.selections };
  }
}

customElements.define('product-recommender', ProductRecommender);

