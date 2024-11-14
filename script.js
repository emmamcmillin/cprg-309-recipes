// Function to convert metric to imperial and round to two decimals
function convertToImperial({ amount, unit }) {
    const conversionTable = {
        grams: { factor: 0.03527396, unit: 'ounces' },
        milliliters: { factor: 0.033814, unit: 'fluid ounces' },
        liters: { factor: 0.264172, unit: 'quarts' },
        kilograms: { factor: 2.20462, unit: 'pounds' },
    };

    if (unit in conversionTable) {
        amount = parseFloat((amount * conversionTable[unit].factor).toFixed(2));
        unit = conversionTable[unit].unit;
    }
    return { amount, unit };
}

// Function to format time (minutes to hours and minutes)
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours
        ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
        : `${remainingMinutes} minutes`;
}

// Fetch and handle recipes JSON data
fetch('recipes.json')
    .then(response => response.json())
    .then(data => {
        console.log('Loaded recipe data:', data);

        const recipeDetails = document.getElementById('recipeDetails');
        const ingredientsList = document.getElementById('ingredients');
        const instructionsList = document.getElementById('instructions');
        let isImperial = false;

        if (!recipeDetails || !ingredientsList || !instructionsList) {
            console.error('Missing essential HTML elements.');
            return;
        }

        // Create and append dropdown menu
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.classList.add('dropdown-wrapper');

        const dropdown = document.createElement('select');
        dropdown.id = 'recipeDropdown';
        dropdown.innerHTML = '<option selected disabled>Select a recipe</option>';
        
        data.forEach((recipe, index) => {
            const option = new Option(recipe.name, index);
            dropdown.appendChild(option);
        });

        dropdownWrapper.appendChild(dropdown);
        document.querySelector('h1').after(dropdownWrapper);

        // Create and append button container
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'buttonContainer';
        buttonContainer.innerHTML = `
            <button id="doubleServings">Double Servings</button>
            <button id="toggleUnits">Switch to Imperial</button>
        `;
        recipeDetails.prepend(buttonContainer);

        // Double servings
        buttonContainer.querySelector('#doubleServings').addEventListener('click', () => {
            const recipe = data[dropdown.value];
            if (recipe) {
                console.log('Doubling servings for recipe:', recipe.name);
                recipe.servings *= 2;
                recipe.ingredients.forEach(ingredient => ingredient.amount *= 2);
                document.getElementById('servings').textContent = recipe.servings;
                renderIngredients(recipe);
            }
        });

        // Display recipe when selection changes
        dropdown.addEventListener('change', () => {
            const recipe = data[dropdown.value];
            if (recipe) {
                console.log('Selected recipe:', recipe);
                recipeDetails.style.display = 'block';
                buttonContainer.style.display = 'flex';

                // Populate recipe details
                const { image, name, description, cuisine, prepTime, cookTime, servings, difficulty } = recipe;
                document.getElementById('recipeImage').src = `assets/${image}`;
                document.getElementById('recipeImage').alt = name;
                document.getElementById('recipeName').textContent = name;
                document.getElementById('description').textContent = description;
                document.getElementById('cuisine').textContent = cuisine;
                document.getElementById('prepTime').textContent = formatTime(prepTime);
                document.getElementById('cookTime').textContent = formatTime(cookTime);
                document.getElementById('servings').textContent = servings;
                document.getElementById('difficulty').textContent = difficulty;

                renderIngredients(recipe);
                renderInstructions(recipe.instructions);
            } else {
                recipeDetails.style.display = 'none';
            }
        });

        // Toggle between metric and imperial units
        buttonContainer.querySelector('#toggleUnits').addEventListener('click', () => {
            isImperial = !isImperial;
            const recipe = data[dropdown.value];
            if (recipe) renderIngredients(recipe);
            buttonContainer.querySelector('#toggleUnits').textContent = isImperial ? 'Switch to Metric' : 'Switch to Imperial';
        });

        // Render ingredients
        function renderIngredients(recipe) {
            ingredientsList.innerHTML = '';
            recipe.ingredients.forEach(ingredient => {
                const { amount, unit } = isImperial ? convertToImperial(ingredient) : ingredient;
                const item = document.createElement('li');
                item.textContent = `${amount} ${unit} ${ingredient.item}`;
                ingredientsList.appendChild(item);
            });
        }

        // Render instructions
        function renderInstructions(instructions) {
            instructionsList.innerHTML = '';
            instructions.forEach(instruction => {
                const step = document.createElement('li');
                step.textContent = instruction.text;
                instructionsList.appendChild(step);
            });
        }
    })
    .catch(error => {
        console.error('Error loading recipes:', error);
        recipeDetails.innerHTML = '<p>Failed to load recipes. Please try again later.</p>';
    });
