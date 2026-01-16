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
    this.optimizeForHomepage();
  }

  /**
   * Apply homepage-specific optimizations
   */
  optimizeForHomepage() {
    // Check if we're on homepage
    const isHomepage = document.body.classList.contains('template-index') || 
                       window.location.pathname === '/' || 
                       window.location.pathname === '/index';
    
    if (isHomepage) {
      // Lazy load images with Intersection Observer
      this.setupLazyLoading();
      
      // Defer non-critical animations
      this.deferAnimations();
    }
  }

  /**
   * Setup lazy loading for images
   */
  setupLazyLoading() {
    const images = this.querySelectorAll('.product-recommender__product-image');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = /** @type {HTMLImageElement} */ (entry.target);
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => {
        const htmlImg = /** @type {HTMLImageElement} */ (img);
        if (htmlImg.dataset.src) {
          imageObserver.observe(htmlImg);
        }
      });
    }
  }

  /**
   * Defer non-critical animations for better performance
   */
  deferAnimations() {
    // Use requestIdleCallback if available, otherwise use setTimeout
    const idleCallback = typeof window.requestIdleCallback === 'function' 
      ? window.requestIdleCallback 
      : setTimeout;
    
    idleCallback(() => {
      this.classList.add('product-recommender--animations-ready');
    }, 100);
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
      // If no mapping found, use default recommendations
      const defaultMapping = this.getDefaultRecommendation();
      if (defaultMapping && defaultMapping.settings && defaultMapping.settings.product) {
        await this.loadProductData(defaultMapping);
        this.displayProduct(defaultMapping);
      } else {
        console.warn('No matching product found for selections:', this.selections);
      }
    }
  }

  /**
   * Get default recommendations based on selections with real product IDs
   * @returns {{settings: {trip_type: string, cost_range: string, coverage_level: string, product: string, product_id: string, variant_id: string, variant_name: string, image_id?: string, override_title: string, override_copy: string, override_price: string}} | null}
   */
  getDefaultRecommendation() {
    const { tripType, costRange, coverageLevel } = this.selections;
    
    // Default recommendations with real product IDs and variant IDs
    const defaultRecommendations = {
      // Single trip combinations
      'single_under_500_standard': {
        settings: {
          trip_type: 'single',
          cost_range: 'under_500',
          coverage_level: 'standard',
          product: 'travel-document-check',
          product_id: '8099666395172',
          variant_id: '43165258088484',
          variant_name: 'Standard',
          image_id: '37221019910180',
          override_title: 'Basic Travel Protection',
          override_copy: 'Perfect for short trips under €500. Essential coverage for peace of mind.',
          override_price: '$20.00'
        }
      },
      'single_under_500_premium': {
        settings: {
          trip_type: 'single',
          cost_range: 'under_500',
          coverage_level: 'premium',
          product: 'travel-document-check',
          product_id: '8099666395172',
          variant_id: '43165258121252',
          variant_name: 'Premium',
          image_id: '37221020631076',
          override_title: 'Premium Travel Protection',
          override_copy: 'Enhanced coverage for your budget-friendly trip. Includes medical and trip cancellation.',
          override_price: '$40.00'
        }
      },
      'single_under_500_max': {
        settings: {
          trip_type: 'single',
          cost_range: 'under_500',
          coverage_level: 'max',
          product: 'travel-document-check',
          product_id: '8099666395172',
          variant_id: '43165258121252', // Max uses Premium variant
          variant_name: 'Premium',
          image_id: '37221020631076',
          override_title: 'Maximum Travel Protection',
          override_copy: 'Comprehensive coverage for your trip. Full protection including medical, cancellation, and baggage.',
          override_price: '$40.00'
        }
      },
      'single_500_1500_standard': {
        settings: {
          trip_type: 'single',
          cost_range: '500_1500',
          coverage_level: 'standard',
          product: 'flight-delay-coverage',
          product_id: '8099666231332',
          variant_id: '43165258481700',
          variant_name: 'Standard',
          image_id: '37220987273252',
          override_title: 'Standard Travel Insurance',
          override_copy: 'Reliable coverage for mid-range trips. Essential protection for your journey.',
          override_price: '$50.00'
        }
      },
      'single_500_1500_premium': {
        settings: {
          trip_type: 'single',
          cost_range: '500_1500',
          coverage_level: 'premium',
          product: 'flight-delay-coverage',
          product_id: '8099666231332',
          variant_id: '43165258514468',
          variant_name: 'Premium',
          image_id: '37220987797540',
          override_title: 'Premium Travel Insurance',
          override_copy: 'Enhanced protection for your mid-range trip. Comprehensive medical and cancellation coverage.',
          override_price: '$80.00'
        }
      },
      'single_500_1500_max': {
        settings: {
          trip_type: 'single',
          cost_range: '500_1500',
          coverage_level: 'max',
          product: 'flight-delay-coverage',
          product_id: '8099666231332',
          variant_id: '43165258514468', // Max uses Premium variant
          variant_name: 'Premium',
          image_id: '37220987797540',
          override_title: 'Maximum Travel Insurance',
          override_copy: 'Complete protection for your trip. All-inclusive coverage for peace of mind.',
          override_price: '$80.00'
        }
      },
      'single_over_1500_standard': {
        settings: {
          trip_type: 'single',
          cost_range: 'over_1500',
          coverage_level: 'standard',
          product: 'trip-cancellation-insurance',
          product_id: '8099664429092',
          variant_id: '43165258874916',
          variant_name: 'Standard',
          image_id: '37220980031524',
          override_title: 'Standard Premium Coverage',
          override_copy: 'Essential protection for high-value trips. Reliable coverage for your investment.',
          override_price: '$50.00'
        }
      },
      'single_over_1500_premium': {
        settings: {
          trip_type: 'single',
          cost_range: 'over_1500',
          coverage_level: 'premium',
          product: 'trip-cancellation-insurance',
          product_id: '8099664429092',
          variant_id: '43165258907684',
          variant_name: 'Premium',
          image_id: '37220981768228',
          override_title: 'Premium High-Value Coverage',
          override_copy: 'Enhanced protection for premium trips. Comprehensive medical, cancellation, and baggage coverage.',
          override_price: '$70.00'
        }
      },
      'single_over_1500_max': {
        settings: {
          trip_type: 'single',
          cost_range: 'over_1500',
          coverage_level: 'max',
          product: 'trip-cancellation-insurance',
          product_id: '8099664429092',
          variant_id: '43165258907684', // Max uses Premium variant
          variant_name: 'Premium',
          image_id: '37220981768228',
          override_title: 'Maximum Premium Coverage',
          override_copy: 'Ultimate protection for your premium trip. Full coverage including medical emergencies, trip cancellation, and premium benefits.',
          override_price: '$70.00'
        }
      },
      // Multi-trip combinations
      'multi_under_500_standard': {
        settings: {
          trip_type: 'multi',
          cost_range: 'under_500',
          coverage_level: 'standard',
          product: 'travel-document-check',
          product_id: '8099666395172',
          variant_id: '43165258088484',
          variant_name: 'Standard',
          image_id: '37221019910180',
          override_title: 'Multi-Trip Basic Protection',
          override_copy: 'Coverage for multiple budget trips throughout the year. Essential protection for frequent travelers.',
          override_price: '$20.00'
        }
      },
      'multi_under_500_premium': {
        settings: {
          trip_type: 'multi',
          cost_range: 'under_500',
          coverage_level: 'premium',
          product: 'travel-document-check',
          product_id: '8099666395172',
          variant_id: '43165258121252',
          variant_name: 'Premium',
          image_id: '37221020631076',
          override_title: 'Multi-Trip Premium Protection',
          override_copy: 'Enhanced multi-trip coverage for budget travelers. Comprehensive protection for all your trips.',
          override_price: '$40.00'
        }
      },
      'multi_under_500_max': {
        settings: {
          trip_type: 'multi',
          cost_range: 'under_500',
          coverage_level: 'max',
          product: 'travel-document-check',
          product_id: '8099666395172',
          variant_id: '43165258121252', // Max uses Premium variant
          variant_name: 'Premium',
          image_id: '37221020631076',
          override_title: 'Multi-Trip Maximum Protection',
          override_copy: 'Complete multi-trip coverage. Full protection for all your budget trips throughout the year.',
          override_price: '$40.00'
        }
      },
      'multi_500_1500_standard': {
        settings: {
          trip_type: 'multi',
          cost_range: '500_1500',
          coverage_level: 'standard',
          product: 'flight-delay-coverage',
          product_id: '8099666231332',
          variant_id: '43165258481700',
          variant_name: 'Standard',
          image_id: '37220987273252',
          override_title: 'Multi-Trip Standard Coverage',
          override_copy: 'Reliable multi-trip protection for mid-range travelers. Essential coverage for frequent trips.',
          override_price: '$50.00'
        }
      },
      'multi_500_1500_premium': {
        settings: {
          trip_type: 'multi',
          cost_range: '500_1500',
          coverage_level: 'premium',
          product: 'flight-delay-coverage',
          product_id: '8099666231332',
          variant_id: '43165258514468',
          variant_name: 'Premium',
          image_id: '37220987797540',
          override_title: 'Multi-Trip Premium Coverage',
          override_copy: 'Enhanced multi-trip protection. Comprehensive coverage for all your mid-range journeys.',
          override_price: '$80.00'
        }
      },
      'multi_500_1500_max': {
        settings: {
          trip_type: 'multi',
          cost_range: '500_1500',
          coverage_level: 'max',
          product: 'flight-delay-coverage',
          product_id: '8099666231332',
          variant_id: '43165258514468', // Max uses Premium variant
          variant_name: 'Premium',
          image_id: '37220987797540',
          override_title: 'Multi-Trip Maximum Coverage',
          override_copy: 'Complete multi-trip protection. All-inclusive coverage for frequent mid-range travelers.',
          override_price: '$80.00'
        }
      },
      'multi_over_1500_standard': {
        settings: {
          trip_type: 'multi',
          cost_range: 'over_1500',
          coverage_level: 'standard',
          product: 'trip-cancellation-insurance',
          product_id: '8099664429092',
          variant_id: '43165258874916',
          variant_name: 'Standard',
          image_id: '37220980031524',
          override_title: 'Multi-Trip Premium Standard',
          override_copy: 'Essential multi-trip protection for high-value travelers. Reliable coverage for premium trips.',
          override_price: '$50.00'
        }
      },
      'multi_over_1500_premium': {
        settings: {
          trip_type: 'multi',
          cost_range: 'over_1500',
          coverage_level: 'premium',
          product: 'trip-cancellation-insurance',
          product_id: '8099664429092',
          variant_id: '43165258907684',
          variant_name: 'Premium',
          image_id: '37220981768228',
          override_title: 'Multi-Trip Premium Plus',
          override_copy: 'Enhanced multi-trip protection for premium travelers. Comprehensive coverage for all your high-value trips.',
          override_price: '$70.00'
        }
      },
      'multi_over_1500_max': {
        settings: {
          trip_type: 'multi',
          cost_range: 'over_1500',
          coverage_level: 'max',
          product: 'trip-cancellation-insurance',
          product_id: '8099664429092',
          variant_id: '43165258907684', // Max uses Premium variant
          variant_name: 'Premium',
          image_id: '37220981768228',
          override_title: 'Multi-Trip Ultimate Coverage',
          override_copy: 'Ultimate multi-trip protection. Complete coverage for frequent premium travelers with maximum benefits.',
          override_price: '$70.00'
        }
      }
    };

    const key = `${tripType}_${costRange}_${coverageLevel}`;
    const recommendation = /** @type {any} */ (defaultRecommendations)[key];
    
    if (recommendation) {
      return recommendation;
    }
    
    // Fallback to a generic recommendation
    return {
      settings: {
        trip_type: tripType || 'single',
        cost_range: costRange || '500_1500',
        coverage_level: coverageLevel || 'standard',
        product: 'flight-delay-coverage',
        product_id: '8099666231332',
        variant_id: '43165258481700',
        variant_name: 'Standard',
        image_id: '37220987273252',
        override_title: 'Travel Protection Plan',
        override_copy: 'Comprehensive travel protection tailored to your needs. Get peace of mind for your journey.',
        override_price: '$50.00'
      }
    };
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
   * @param {{settings?: {trip_type?: string, cost_range?: string, coverage_level?: string, product?: string, product_id?: string, variant_id?: string, variant_name?: string, image_id?: string, override_title?: string, override_copy?: string, override_price?: string}}} mapping - The product mapping object
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
      
      // Find variant by ID if specified
      if (mapping.settings.variant_id) {
        const variantId = parseInt(mapping.settings.variant_id);
        this.currentVariant = this.currentProduct.variants.find(/** @param {any} v */ (v) => v.id === variantId);
      }
      
      // Find variant by name if specified (and not found by ID)
      if (!this.currentVariant && mapping.settings.variant_name) {
        const variantName = mapping.settings.variant_name.trim();
        this.currentVariant = this.currentProduct.variants.find(/** @param {any} v */ (v) => {
          const title = (v.title || '').toLowerCase();
          const name = variantName.toLowerCase();
          return title === name || title.includes(name);
        });
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
   * Get default benefits based on coverage level
   * @param {string} coverageLevel - The coverage level (standard, premium, max)
   * @returns {string[]} Array of benefit texts
   */
  getDefaultBenefits(coverageLevel) {
    const benefits = /** @type {{[key: string]: string[]}} */ ({
      'standard': [
        '24/7 Travel Assistance',
        'Trip Cancellation Coverage',
        'Medical Emergency Protection'
      ],
      'premium': [
        '24/7 Travel Assistance',
        'Trip Cancellation & Interruption',
        'Medical Emergency & Evacuation',
        'Baggage Loss & Delay Coverage',
        'Flight Delay Compensation'
      ],
      'max': [
        '24/7 Premium Travel Assistance',
        'Full Trip Cancellation & Interruption',
        'Comprehensive Medical & Evacuation',
        'Baggage Loss, Delay & Theft Coverage',
        'Flight Delay & Missed Connection',
        'Travel Document Replacement',
        'Emergency Cash Transfer'
      ]
    });
    
    const defaultBenefits = benefits['standard'] || [];
    
    if (!coverageLevel) {
      return defaultBenefits;
    }
    
    const selectedBenefits = benefits[coverageLevel];
    return selectedBenefits || defaultBenefits;
  }

  /**
   * Display the recommended product
   * @param {{settings?: {trip_type?: string, cost_range?: string, coverage_level?: string, product?: string, product_id?: string, variant_id?: string, variant_name?: string, image_id?: string, override_title?: string, override_copy?: string, override_price?: string}}} mapping - The product mapping object
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

    // Update product image - use image_id from mapping or variant's image_id
    const imageElement = /** @type {HTMLImageElement | null} */ (resultContainer.querySelector('.product-recommender__product-image'));
    if (imageElement) {
      let imageUrl = '';
      
      // Helper function to safely get image URL
      const getImageUrl = (/** @type {any} */ imageObj) => {
        if (!imageObj) return '';
        if (typeof imageObj === 'string') return imageObj;
        if (imageObj.src && typeof imageObj.src === 'string') return imageObj.src;
        return '';
      };
      
      // Priority 1: Find image by image_id from mapping settings
      if (mapping.settings.image_id && this.currentProduct.images && Array.isArray(this.currentProduct.images)) {
        const imageId = parseInt(mapping.settings.image_id);
        const foundImage = this.currentProduct.images.find(/** @param {any} img */ (img) => img && img.id === imageId);
        if (foundImage) {
          imageUrl = getImageUrl(foundImage);
        }
      }
      
      // Priority 2: Find image by variant's image_id
      if (!imageUrl && this.currentVariant && this.currentVariant.image_id && this.currentProduct.images && Array.isArray(this.currentProduct.images)) {
        const foundImage = this.currentProduct.images.find(/** @param {any} img */ (img) => img && img.id === this.currentVariant.image_id);
        if (foundImage) {
          imageUrl = getImageUrl(foundImage);
        }
      }
      
      // Priority 3: Use variant's featured_image
      if (!imageUrl && this.currentVariant) {
        imageUrl = getImageUrl(this.currentVariant.featured_image);
      }
      
      // Priority 4: Use product's featured image
      if (!imageUrl && this.currentProduct.image) {
        imageUrl = getImageUrl(this.currentProduct.image);
      }
      
      // Priority 5: Use first available product image
      if (!imageUrl && this.currentProduct.images && Array.isArray(this.currentProduct.images) && this.currentProduct.images.length > 0) {
        const firstImage = this.currentProduct.images[0];
        imageUrl = getImageUrl(firstImage);
      }
      
      // Set image URL if found
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0) {
        imageElement.src = imageUrl;
        imageElement.alt = this.currentProduct.title || '';
      } else {
        console.warn('No valid image URL found for product:', {
          productId: this.currentProduct.id,
          variantId: this.currentVariant?.id,
          mappingImageId: mapping.settings.image_id,
          hasImages: !!this.currentProduct.images,
          imagesCount: this.currentProduct.images?.length || 0
        });
        // Hide image if no URL found
        imageElement.style.display = 'none';
      }
    }

    // Update product title from Shopify (segunda columna)
    const titleShopify = resultContainer.querySelector('.product-recommender__product-title--shopify');
    if (titleShopify) {
      const titleText = this.currentProduct.title;
      titleShopify.textContent = titleText;
    }

    // Update product copy from Shopify (segunda columna)
    const copyShopify = resultContainer.querySelector('.product-recommender__product-copy--shopify');
    if (copyShopify) {
      let copyText = '';
      
      // Extract text from body_html
      if (this.currentProduct && this.currentProduct.body_html) {
        // Create a temporary div to extract text from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.currentProduct.body_html;
        
        // Get text content (this automatically strips HTML tags)
        copyText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean up whitespace
        copyText = copyText.replace(/\s+/g, ' ').trim();
      }
      
      // Fallback to description if available
      if (!copyText && this.currentProduct && this.currentProduct.description) {
        copyText = this.currentProduct.description;
      }
      
      // IMPORTANT: Clear innerHTML first, then set textContent to ensure no HTML is rendered
      copyShopify.innerHTML = '';
      const htmlElement = /** @type {HTMLElement} */ (copyShopify);
      htmlElement.textContent = copyText || '';
    }

    // Update product price badge above image
    const priceBadge = resultContainer.querySelector('.product-recommender__price-badge');
    if (priceBadge) {
      let priceText = '';
      
      if (mapping.settings.override_price) {
        priceText = mapping.settings.override_price;
      } else if (this.currentVariant && this.currentVariant.price) {
        // Handle price as string (e.g., "50.00") or number in cents
        let priceValue = 0;
        if (typeof this.currentVariant.price === 'string') {
          priceValue = parseFloat(this.currentVariant.price);
        } else if (typeof this.currentVariant.price === 'number') {
          // If price is in cents, divide by 100
          priceValue = this.currentVariant.price > 1000 ? this.currentVariant.price / 100 : this.currentVariant.price;
        }
        
        // Always display prices in USD
        const currencySymbol = '$';
        const formattedPrice = priceValue.toFixed(2);
        priceText = `${currencySymbol}${formattedPrice}`;
      } else {
        priceText = 'Price on request';
      }
      
      priceBadge.textContent = priceText;
    }

    // Update benefits
    const benefitsList = resultContainer.querySelector('.product-recommender__product-benefits');
    if (benefitsList) {
      benefitsList.innerHTML = '';
      
      // Get benefits - use configured benefits or default benefits based on coverage level
      let benefitsToDisplay = [];
      
      if (this.benefits && this.benefits.length > 0) {
        // Use configured benefits from Theme Editor
        benefitsToDisplay = this.benefits.map(benefit => {
          if (benefit && benefit.settings && benefit.settings.benefit_text) {
            return benefit.settings.benefit_text;
          }
          return null;
        }).filter(b => b !== null);
      } else {
        // Use default benefits based on coverage level
        const coverageLevel = mapping.settings.coverage_level || 'standard';
        benefitsToDisplay = this.getDefaultBenefits(coverageLevel);
      }
      
      // Display benefits
      benefitsToDisplay.forEach(/** @param {string} benefitText */ (benefitText) => {
        const li = document.createElement('li');
        li.textContent = benefitText;
        benefitsList.appendChild(li);
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
    const htmlButton = /** @type {HTMLButtonElement} */ (button);
    const ctaType = htmlButton.dataset.ctaType || 'add_to_cart';
    
    if (ctaType === 'add_to_cart') {
      await this.addToCart(htmlButton);
    } else {
      // Navigate to product page
      const productHandle = htmlButton.dataset.productHandle;
      if (productHandle) {
        window.location.href = `/products/${productHandle}`;
      }
    }
  }

  /**
   * Add product to cart
   * @param {HTMLButtonElement} button - The CTA button element
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

      // Use basic fetch config (fetchConfig utility not available in this context)
      const fetchCfg = {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      };

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

