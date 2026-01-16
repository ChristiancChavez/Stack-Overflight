# Stack Overflight — Shopify Theme Development

Stack Overflight is an e-commerce platform specializing in **travel insurance products** including Flight Delay Coverage, Travel Document Check, and Trip Cancellation Insurance. This repository contains custom Shopify theme development work focused on enhancing user experience, conversion optimization, and trust-building elements.

---

## 🏪 About the Store

**Stack Overflight** is a digital-first travel insurance marketplace that helps travelers find and purchase the right coverage for their trips. The store offers:

- **Flight Delay Coverage** — Protection against flight delays and cancellations
- **Travel Document Check** — Assistance with travel documentation
- **Trip Cancellation Insurance** — Coverage for trip cancellations and interruptions

All products are **digital goods** (no shipping required), making them ideal for instant purchase and immediate coverage activation.

---

## 🧱 Theme Base

**Horizon (Free Shopify Theme)**

**Why Horizon:**
- Official Shopify reference theme
- Clean, modern, and performance-focused
- Ideal for demonstrating best practices with sections, JSON templates, and theme settings
- Upgrade-friendly and production-ready baseline

---

## ✨ Implemented Features

### 1. Product Recommender System (Core Feature)
- **Location:** `sections/product-recommender.liquid`
- Interactive questionnaire system that guides customers to the right insurance product
- Dynamic product recommendations based on user selections
- Features:
  - Step-by-step selection process
  - Personalized product matching
  - Clear pricing and benefit displays
  - Direct "Add to Cart" functionality
- Fully configurable from Theme Editor
- Responsive design with smooth UX transitions

### 2. Trust Badges Component
- **Location:** `snippets/trust-badges.liquid` + `sections/trust-badges.liquid`
- Reusable trust badge system for building customer confidence
- Features:
  - Up to 6 configurable badges per section
  - Individual customization per badge:
    - Custom text
    - Icon/image support
    - Optional clickable links
    - Custom background color
    - Custom text color (default: white)
  - Layout options: Horizontal or Vertical
  - Alignment options: Left, Center, Right
  - Icon size options: Small, Medium, Large
  - Spacing controls: Small, Medium, Large
  - Card-style design with hover effects
  - Rounded corners on icons (8px border-radius)
- **Used on:**
  - Home page (configured in `templates/index.json`)
  - Product pages (via blocks)
  - Cart page (via blocks)
- Fully configurable from Theme Editor without code changes

### 3. Cart Upsell Section
- **Location:** `sections/cart-upsell.liquid` + `snippets/cart-upsell-product.liquid`
- Smart product recommendations in the cart to increase average order value
- Features:
  - Automatically hides products already in cart
- Configurable product selection per upsell item:
  - Always show or conditional display
  - Custom title and description overrides
- Responsive card layout:
  - Horizontal layout on desktop
  - Vertical layout on mobile
  - Optimized sizing and spacing
- Grid layout with centered alignment

### 4. Featured Product Section Enhancement
- **Location:** `sections/featured-product.liquid`
- Enhanced featured product display with trust badges integration
- Supports trust badges as optional blocks within featured product cards

---

## 📂 Key Files & Structure

### Sections
- `sections/product-recommender.liquid`  
  → Interactive product recommendation system with questionnaire logic

- `sections/trust-badges.liquid`  
  → Trust badges section wrapper with configuration options

- `sections/cart-upsell.liquid`  
  → Cart page upsell section with smart product filtering

- `sections/featured-product.liquid`  
  → Featured product display with trust badges support

### Snippets
- `snippets/trust-badges.liquid`  
  → Reusable trust badge component with full customization support
  → Supports up to 6 badges
  → Card-style design with hover effects
  → Color customization (background and text)

- `snippets/cart-upsell-product.liquid`  
  → Individual upsell product card component
  → Responsive design with image optimization

### Templates
- `templates/index.json`  
  → Home page configuration with Product Recommender and Trust Badges

- `templates/cart.json`  
  → Cart page with upsell section and trust badges support

- `templates/product.json`  
  → Product page layout with trust badges integration

### Blocks
- `blocks/_product-details.liquid`  
  → Product details block supporting trust badges as sub-blocks

---

## 🎨 Design Features

### Trust Badges
- **Card Design:** Each badge is displayed as an individual card with:
  - Background color customization
  - Text color customization (default: white)
  - Border and shadow effects
  - Hover animations (lift effect + enhanced shadow)
  - Rounded corners (8px border-radius)

- **Layout Options:**
  - Horizontal: Badges displayed in a row
  - Vertical: Badges stacked vertically
  - Flexible alignment options

- **Icon Support:**
  - Image upload via Theme Editor
  - Three size options (small: 32px, medium: 48px, large: 64px)
  - Icons positioned above text in card layout
  - 8px border-radius on icon images

### Cart Upsell
- Responsive grid layout
- Product cards with optimized sizing
- Smart filtering (excludes products already in cart)
- Configurable visibility rules

---

## 🛠️ Technical Implementation

### Architecture Decisions
- **Reusable Components:** Trust badges implemented as snippets for maximum reusability
- **Theme Editor Integration:** All features fully configurable without code changes
- **Performance:** Minimal JavaScript, Liquid-first approach
- **Responsive:** Mobile-first design with breakpoint optimizations
- **Maintainable:** Clean separation of concerns, modular code structure

### Key Technologies
- **Shopify Liquid:** Theme templating
- **JSON Templates:** Section configuration
- **CSS:** Custom styling with CSS variables support
- **Vanilla JavaScript:** Minimal JS for interactive features only

---

## 📝 Configuration Guide

### Adding Trust Badges
1. Go to Theme Editor
2. Navigate to the desired page (Home, Cart, Product)
3. Add or edit the "Trust Badges" section
4. Configure each badge:
   - Enter badge text
   - Upload icon image (optional)
   - Add link URL (optional)
   - Set background color
   - Set text color (default: white)
5. Adjust layout settings:
   - Layout direction (horizontal/vertical)
   - Alignment (left/center/right)
   - Icon size
   - Spacing between badges

### Configuring Cart Upsell
1. Go to Theme Editor → Cart page
2. Find the "Cart Upsell" section
3. Add upsell products
4. Configure each product:
   - Select product
   - Set display rules (always show or conditional)
   - Customize title/description if needed

---

## 🚀 Future Enhancements (Potential)

- Additional trust badge layouts (banner style, inline text)
- Cart upsell analytics tracking
- Product recommender A/B testing capabilities
- Multi-language support for trust badges
- Dynamic badge visibility rules based on cart value

---

## 📖 Notes

This implementation follows Shopify best practices:
- ✅ Clean, maintainable Liquid code
- ✅ Theme Editor integration
- ✅ Responsive design
- ✅ Performance optimization
- ✅ User experience focus
- ✅ Scalable architecture

All customizations are designed to be upgrade-safe and maintainable for future development.
