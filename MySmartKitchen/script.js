// Declared here so future gemini.js API can access it when "Generate" is clicked
let ingredients = [];

// Add hover effect to navigation links
document.querySelectorAll('nav ul a').forEach(link => {

 // Preview text was removed already so function was removed
  link.addEventListener('mouseleave', function () {
    // Drops focus so the link doesn't stay highlighted after clicking
    this.blur();
  });

});

//Ingredient tag system 
const input   = document.getElementById('ingredient-input');
const addBtn  = document.getElementById('add-btn');
const tagArea = document.getElementById('tag-area');

if (input && addBtn && tagArea) {

  function addTag(value) {
    const trimmed = value.trim();
    if (!trimmed) return;

    // added this line that pushes the ingredient into the array so file gemini.js can read it
    ingredients.push(trimmed);

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${trimmed} <button aria-label="Remove ${trimmed}">✕</button>`;

    tag.querySelector('button').addEventListener('click', () => {
    // Added this line so it removes the filter from the array when X is clicked
      ingredients = ingredients.filter(i => i !== trimmed);
      tag.style.transform = 'scale(0)';
      tag.style.opacity   = '0';
      tag.style.transition = 'all 0.15s ease';
      setTimeout(() => tag.remove(), 150);
    });

    tagArea.appendChild(tag);
    input.value = '';
    input.focus();
  }

  addBtn.addEventListener('click', () => addTag(input.value));

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTag(input.value);
  });

}

// Filter toggle system
const activeFilters = { cuisine: null, diet: [] };

// Cuisine: single-select
document.querySelectorAll('#cuisine-filters .filter-pill').forEach(btn => {
  btn.addEventListener('click', function () {
    const wasActive = this.classList.contains('active');
    document.querySelectorAll('#cuisine-filters .filter-pill')
      .forEach(b => b.classList.remove('active'));
    if (!wasActive) {
      this.classList.add('active');
      activeFilters.cuisine = this.dataset.filter;
    } else {
      activeFilters.cuisine = null;
    }
  });
});

// Diet: multi-select
document.querySelectorAll('#diet-filters .filter-pill').forEach(btn => {
  btn.addEventListener('click', function () {
    this.classList.toggle('active');
    const filter = this.dataset.filter;
    if (this.classList.contains('active')) {
      activeFilters.diet.push(filter);
    } else {
      activeFilters.diet = activeFilters.diet.filter(f => f !== filter);
    }
  });
});
