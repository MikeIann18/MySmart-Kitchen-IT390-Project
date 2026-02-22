// Create element (tooltip) for preview text
const tooltip = document.createElement('div');
document.body.appendChild(tooltip);


// Preview text for each menu item
const previews = {
  'Home': 'Welcome to your smart kitchen dashboard',
  'Features': 'Voice input, alerts, and AI suggestions',
  'Recipes': 'Discover personalized meal ideas',
  'Inventory': 'Track pantry items and expiration dates',
  'Contact': 'Get in touch with our support team'
};


// Add hover effect to navigation links
document.querySelectorAll('nav a').forEach(link => {
  
  // Mouse enters link
  link.onmouseover = function() {
    this.style.background = '#085a6e';
    tooltip.textContent = previews[this.textContent];
  };
  
  // Mouse leaves link
  link.onmouseout = function() {
    this.style.background = 'transparent';
    tooltip.textContent = '';
  };
  
});
