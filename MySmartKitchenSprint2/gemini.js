
// The Gemini API endpoint we send requests to
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;


async function generateRecipes() {

    // Check that user actually added ingredients before calling API
    if (ingredients.length === 0) {
        alert("Please add at least one ingredient first.");
        return;
    }

    // Show a loading message while waiting for Gemini to respond
    document.getElementById("results-area").innerHTML = "Generating recipes...";

	// Connection of filtering line
	const cuisineText = activeFilters.cuisine ? `Cuisine type: ${activeFilters.cuisine}.` : '';
	const dietText = activeFilters.diet.length > 0 ? `Dietary restrictions: ${activeFilters.diet.join(", ")}.` : '';

    //Connects the filter section line and sends instructions to gemini and requesting 3 recipe options to give the user options
    const prompt = `
        You are a professional recipe developer and culinary expert pulling from credible sources.
		Your task is to generate 3 beginner-friendly recipes using these ingredients: ${ingredients.join(", ")}.
		${activeFilters.cuisine ? `Only generate recipes that are ${activeFilters.cuisine} cuisine.` : ''}
		${activeFilters.diet.length > 0 ? `All recipes must strictly follow these dietary restrictions: ${activeFilters.diet.join(", ")}.` : ''}
		Prioritize the provided ingredients and minimize additional ones.
		For each recipe provide:
		- Recipe Name
		- Cuisine Type
        - Short Description (2-3 sentences)
        - Estimated Time (Prep + Cook)
        - Difficulty Level (Easy / Medium / Hard)
        - Ingredients (with measurements)
        - Step-by-Step Instructions (numbered)
        - Nutritional Estimate (Calories, Protein, Carbs, Fat)
        - Storage Instructions
		Keep tone clear, encouraging, and practical.
        Avoid long introductions or unnecessary background.
        Use clean and organized, spacing between sections.
        `;

        try {
            // Sending the prompt using fetch() to Gemini's API
            const response = await fetch(GEMINI_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                       parts: [{ text: prompt }]
                    }]
                })
            });
			// Parse the response Gemini sends back
            const data = await response.json();

            // Check if the API returned an error instead of recipes
             if (!response.ok || !data.candidates) {
				// If the primary model failed, try backup models (pro then flash)
                console.warn("Primary model failed:", data.error?.message);
                if (backupIndex < BACKUP_MODELS.length) {
                    const backupURL = `https://generativelanguage.googleapis.com/v1beta/models/${BACKUP_MODELS[backupIndex]}:generateContent?key=${GEMINI_API_KEY}`;
                    backupIndex++;
                    const retry = await fetch(backupURL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });
                    const retryData = await retry.json();
                    if (retry.ok && retryData.candidates) {
                        displayResults(retryData.candidates[0].content.parts[0].text);
                        backupIndex = 0;
                        return;
                    }
                }
				 // In case all models failed this shows the error to the user
                document.getElementById("results-area").innerHTML =
                    "API error: " + (data.error?.message || "All models failed.");
                backupIndex = 0;
                return;
            }

            // Extract the actual text from Gemini's response structure
            const recipeText = data.candidates[0].content.parts[0].text;

            // Display the results on the page
            displayResults(recipeText);

            // If something goes wrong with the network like no internet or a bad key.
            } catch (error) {
                document.getElementById("results-area").innerHTML = "Something went wrong. Please try again.";
                console.error(error);
            }
            }

            function displayResults(recipeText) {
                const resultsArea = document.getElementById("results-area");
                // Replaces newlines with <br> so the recipe text is readable on the page
                resultsArea.innerHTML = recipeText.replace(/\n/g, "<br>");
            }
