// Cloud Function URL — points to our backend on Google Cloud
// The API key and backup model logic now live on this server, not in the browser
const CLOUD_FUNCTION_URL = "https://us-east1-project-f59aa424-8886-4abc-8f0.cloudfunctions.net/generateRecipes";

async function generateRecipes() {
    // Check that user actually added ingredients before calling the Cloud Function
    if (ingredients.length === 0) {
        alert("Please add at least one ingredient first.");
        return;
    }

    // Show a loading spinner while waiting for the Cloud Function to respond
    document.getElementById("results-area").innerHTML = `
        <div class="results-loading">
            <div class="loading-spinner"></div>
            Generating recipes…
        </div>`;

    // Builds the prompt using the ingredients array and any active filters from script.js
    // This prompt gets sent to our Cloud Function, which forwards it to Gemini
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
        // Sends just the prompt to our Cloud Function — no API key leaves the browser
        // The Cloud Function handles the Gemini request and backup models on the server
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Only sending { prompt } — simpler than before because the server handles the rest
            body: JSON.stringify({ prompt: prompt })
        });

        // Cloud Function returns { recipe: "..." } instead of Gemini's nested response structure
        const data = await response.json();

        // If all models failed on the server, the Cloud Function returns { error: "..." }
        if (data.error) {
            document.getElementById("results-area").innerHTML = `
                <div class="results-error">
                    API error: ${data.error}
                    <small>Check the console for details.</small>
                </div>`;
            return;
        }

        // data.recipe contains the recipe HTML that Gemini generated
        displayResults(data.recipe);

    // If the Cloud Function itself is unreachable (no internet, server down, etc.)
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
    // Replaces the results area with the cleaned recipe HTML
    document.getElementById("results-area").innerHTML = clean;
}
