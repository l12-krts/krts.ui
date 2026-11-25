import '@testing-library/jest-dom/vitest';

// jsdom has no Web Animations API; React Aria's SelectionIndicator uses it.
if (typeof Element !== 'undefined' && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}
