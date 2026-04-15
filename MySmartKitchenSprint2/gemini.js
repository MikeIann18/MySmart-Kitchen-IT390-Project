const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

async function generateRecipes() {

    if (ingredients.length === 0) {
        alert("Please add at least one ingredient first.");
        return;
    }

    document.getElementById("results-area").innerHTML = `
        <div class="results-loading">
            <div class="loading-spinner"></div>
            Generating recipes…
        </div>`;

    const prompt = `
        You are a professional recipe developer. Generate 3 recipes using: ${ingredients.join(", ")}.
        ${activeFilters.cuisine ? `Cuisine: ${activeFilters.cuisine}.` : ''}
        ${activeFilters.diet.length > 0 ? `Dietary restrictions: ${activeFilters.diet.join(", ")}.` : ''}

        Return ONLY raw HTML using exactly these CSS classes. No markdown, no backticks, no explanation, no extra text.

        Use this exact structure for all 3 recipes wrapped in one recipe-grid div:

        <div class="recipe-grid">
          <div class="recipe-card">
            <div class="recipe-card-header">
              <span class="recipe-number">1</span>
              <h3 class="recipe-title">Recipe Name Here</h3>
            </div>
            <div class="recipe-body">
              <h4 class="recipe-section">Description</h4>
              <p>Short 2-3 sentence description here.</p>
              <h4 class="recipe-section">Cuisine & Time & Difficulty</h4>
              <div><span class="bullet">•</span> Cuisine: Italian</div>
              <div><span class="bullet">•</span> Time: 10 min prep / 20 min cook</div>
              <div><span class="bullet">•</span> Difficulty: Easy</div>
              <h4 class="recipe-section">Ingredients</h4>
              <div><span class="bullet">•</span> 1 cup ingredient</div>
              <h4 class="recipe-section">Instructions</h4>
              <div><span class="step-num">1</span> Step one here.</div>
              <h4 class="recipe-section">Nutrition</h4>
              <div><span class="bullet">•</span> Calories: 000 | Protein: 00g | Carbs: 00g | Fat: 00g</div>
              <h4 class="recipe-section">Storage</h4>
              <div><span class="bullet">•</span> Storage instructions here.</div>
            </div>
          </div>
        </div>

        Repeat the recipe-card block for recipes 2 and 3, updating the recipe-number span accordingly.
    `;

    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok || !data.candidates) {
            console.error("API Error:", data);
            document.getElementById("results-area").innerHTML = `
                <div class="results-error">
                    API error: ${data.error?.message || "Unknown error."}
                    <small>Check the console for details.</small>
                </div>`;
            return;
        }

        const recipeText = data.candidates[0].content.parts[0].text;
        displayResults(recipeText);

    } catch (error) {
        document.getElementById("results-area").innerHTML = `
            <div class="results-error">
                Something went wrong. Please try again.
                <small>Check the console for details.</small>
            </div>`;
        console.error(error);
    }
}

function displayResults(recipeText) {
    // Strip any accidental markdown code fences Gemini may add
    const clean = recipeText.replace(/```html|```/gi, "").trim();
    document.getElementById("results-area").innerHTML = clean;
}
