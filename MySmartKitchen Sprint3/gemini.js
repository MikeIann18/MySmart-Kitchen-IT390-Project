// Primary and backup models (tries in order if one fails)
const BACKUP_MODELS = ["gemini-2.5-pro", "gemini-2.5-flash"];
let backupIndex = 0;

// The Gemini API endpoint we send requests to
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

async function generateRecipes() {

    // Check that user actually added ingredients before calling API
    if (ingredients.length === 0) {
        alert("Please add at least one ingredient first.");
        return;
    }

    // Show a loading spinner while waiting for Gemini to respond
    document.getElementById("results-area").innerHTML = `
        <div class="results-loading">
            <div class="loading-spinner"></div>
            Generating recipes…
        </div>`;

    // Sends instructions to Gemini and requests 3 recipe options
    // Also connects the filter section for cuisine and dietary restrictions
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
        // Sending the prompt using fetch() to Gemini's API
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        // Parse the response Gemini sends back
        const data = await response.json();

        // Check if the API returned an error instead of recipes
        if (!response.ok || !data.candidates) {
            // If the primary model failed, try backup models (pro then flash) before giving up
            console.warn("Primary model failed:", data.error?.message);

            if (backupIndex < BACKUP_MODELS.length) {
                const backupURL = `https://generativelanguage.googleapis.com/v1beta/models/${BACKUP_MODELS[backupIndex]}:generateContent?key=${GEMINI_API_KEY}`;
                backupIndex++;
                const retry = await fetch(backupURL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
                const retryData = await retry.json();

                // If the backup model worked, show recipes and reset for next time
                if (retry.ok && retryData.candidates) {
                    displayResults(retryData.candidates[0].content.parts[0].text);
                    backupIndex = 0;
                    return;
                }
            }

            // All models failed — show the error to the user
            document.getElementById("results-area").innerHTML = `
                <div class="results-error">
                    API error: ${data.error?.message || "All models failed."}
                    <small>Check the console for details.</small>
                </div>`;
            backupIndex = 0;
            return;
        }

        // Extract the actual text from Gemini's response structure
        const recipeText = data.candidates[0].content.parts[0].text;

        // Display the results on the page
        displayResults(recipeText);

    // If something goes wrong like no internet or a bad key
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
