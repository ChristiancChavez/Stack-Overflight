# Shopify Liquid Technical Test — Stack Overflight

This repository contains a Shopify theme implementation created as a technical test for a **Shopify Liquid Developer** role.  
The goal was to demonstrate clean Liquid development, real-world UX thinking, and proper use of Shopify theme architecture.

---

## 🧱 Theme Used

**Horizon (Free Shopify Theme)**

**Reasoning:**
- Official Shopify reference theme
- Clean, modern, and performance-focused
- Ideal for demonstrating best practices with sections, JSON templates, and theme settings
- Upgrade-friendly and production-ready baseline

---

## ✨ Implemented Features

### 1. Coverage Builder Section (Core Task)
- Custom reusable section: `sections/coverage-builder.liquid`
- 3-step selector:
  - Trip Type (Single / Multi-trip)
  - Trip Cost Range (<€500, €500–€1500, >€1500)
  - Coverage Level (Standard / Premium / Max)
- Dynamic product or variant recommendation based on user input
- Displays:
  - Product title
  - Short descriptive copy
  - Price
  - 3–5 benefit bullets
  - CTA (Add to Cart or Go to Product)
- Fully configurable from the Theme Editor
- Minimal vanilla JavaScript for state handling
- Responsive, mobile-first, card-based premium UI

### 2. Digital Product Setup
- Travel-related digital products (insurance-style)
- Clear variant differentiation
- Optimized product descriptions and featured images
- No shipping required (digital-only configuration)

### 3. Additional Theme Customizations
- Custom digital product template with:
  - Accordion-based content (benefits, coverage details, FAQs)
  - Trust elements for confidence and clarity
- Reusable trust badges snippet configurable via theme settings

---

## 📂 Main Files to Review

- `sections/coverage-builder.liquid`  
  → Core logic, schema configuration, UI rendering

- `templates/product.json`  
  → Custom product layout for digital products

- `sections/main-product.liquid` (modified)  
  → Accordion structure and trust elements

- `snippets/trust-badges.liquid`  
  → Reusable, configurable trust indicators

- `assets/coverage-builder.js`  
  → Minimal vanilla JS for selection logic (if applicable)

---

## ⚖️ Assumptions & Trade-offs

- Product-to-selection mapping handled via theme settings for flexibility
- No external libraries used to keep performance optimal
- UI prioritizes clarity and conversion over heavy animations
- Logic designed to scale without breaking theme upgrades

---

## 🧪 How to Test the Coverage Builder

1. Open the Theme Editor
2. Add the **Coverage Builder** section to any page
3. Configure:
   - Title & subtitle
   - Benefits (blocks)
   - Product / variant mapping
4. Preview on desktop and mobile
5. Change selector inputs and verify correct product recommendations

---

## 🚀 Final Notes

This implementation reflects real-world Shopify development practices:
- Clean Liquid
- Thoughtful UX
- Maintainable structure
- Performance-conscious decisions

Happy to walk through the solution and discuss trade-offs during the technical review call.

