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
  }

  connectedCallback() {
    this.initializeSelectors();
    this.updateProgress();
  }

  /**
   * Initialize selector buttons and event listeners
   */
  initializeSelectors() {
    const optionCards = this.querySelectorAll('.product-recommender__option-card');
    
    optionCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const step = parseInt(card.dataset.step);
        const value = card.dataset.value;
        
        this.handleSelection(step, value, card);
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
        this.selections.tripType = value;
        break;
      case 2:
        this.selections.costRange = value;
        break;
      case 3:
        this.selections.coverageLevel = value;
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
    const progressFill = this.querySelector('.product-recommender__progress-fill');
    
    if (!progressSteps.length || !progressFill) return;

    // Update step states
    progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      const stepElement = step;
      
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
  onAllStepsComplete() {
    // This will be implemented in the next feature (mapping)
    console.log('All steps completed:', this.selections);
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

