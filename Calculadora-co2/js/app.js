/**
 * app.js - Main application file
 * Handles initialization and form submission for the CO2 calculator
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    
    /**
     * INITIALIZATION
     * Set up the calculator on page load
     */
    
    // Populate the datalist with all available cities
    CONFIG.populateDatalist();
    
    // Setup automatic distance calculation when cities are selected
    CONFIG.setupDistanceAutofill();
    
    // Get the calculator form element
    const calculatorForm = document.getElementById('calculator-form');
    
    // Add submit event listener to the form
    calculatorForm.addEventListener('submit', handleFormSubmit);
    
    // Log successful initialization
    console.log('✅ Calculadora inicializada!');
    
    /**
     * FORM SUBMIT HANDLER
     * Process form data and display calculation results
     * @param {Event} event - Form submit event
     */
    function handleFormSubmit(event) {
        // Prevent default form submission behavior
        event.preventDefault();
        
        /**
         * STEP 1: Get and validate form values
         */
        
        // Get origin city value (trimmed)
        const origin = document.getElementById('origin').value.trim();
        
        // Get destination city value (trimmed)
        const destination = document.getElementById('destination').value.trim();
        
        // Get distance value and parse as float
        const distanceInput = document.getElementById('distance').value;
        const distance = parseFloat(distanceInput);
        
        // Get selected transport mode from radio buttons
        const transportModeInput = document.querySelector('input[name="transport"]:checked');
        const transportMode = transportModeInput ? transportModeInput.value : null;
        
        /**
         * STEP 2: Validate inputs
         */
        
        // Check if all required fields are filled
        if (!origin || !destination) {
            alert('❌ Por favor, preencha a origem e o destino.');
            return;
        }
        
        if (!distance || distance <= 0) {
            alert('❌ Por favor, insira uma distância válida maior que zero.');
            return;
        }
        
        if (!transportMode) {
            alert('❌ Por favor, selecione um meio de transporte.');
            return;
        }
        
        /**
         * STEP 3: Show loading state
         */
        
        // Get submit button element
        const submitButton = calculatorForm.querySelector('.form-submit');
        
        // Show loading spinner on button
        UI.showLoading(submitButton);
        
        // Hide any previous results
        UI.hideElement('results');
        UI.hideElement('comparison');
        UI.hideElement('carbon-credits');
        
        /**
         * STEP 4: Process calculation with simulated delay
         * Simulates API call or heavy processing
         */
        
        setTimeout(function() {
            try {
                /**
                 * CALCULATIONS
                 */
                
                // Calculate emission for selected transport mode
                const emission = Calculator.calculateEmission(distance, transportMode);
                
                // Calculate car emission as baseline for comparison
                const carEmission = Calculator.calculateEmission(distance, 'car');
                
                // Calculate savings compared to car (if not using car)
                const savings = transportMode !== 'car' 
                    ? Calculator.calculateSavings(emission, carEmission)
                    : null;
                
                // Calculate emissions for all transport modes
                const allModesComparison = Calculator.calculateAllModes(distance);
                
                // Calculate carbon credits needed
                const carbonCredits = Calculator.calculateCarbonCredits(emission);
                
                // Calculate estimated price for carbon credits
                const creditPrice = Calculator.estimateCreditPrice(carbonCredits);
                
                /**
                 * BUILD DATA OBJECTS FOR RENDERING
                 */
                
                // Results data object
                const resultsData = {
                    origin: origin,
                    destination: destination,
                    distance: distance,
                    emission: emission,
                    mode: transportMode,
                    savings: savings
                };
                
                // Carbon credits data object
                const creditsData = {
                    credits: carbonCredits,
                    price: creditPrice
                };
                
                /**
                 * RENDER RESULTS
                 */
                
                // Render main results section
                const resultsHTML = UI.renderResults(resultsData);
                document.getElementById('results-content').innerHTML = resultsHTML;
                
                // Render comparison section
                const comparisonHTML = UI.renderComparison(allModesComparison, transportMode);
                document.getElementById('comparison-content').innerHTML = comparisonHTML;
                
                // Render carbon credits section
                const creditsHTML = UI.renderCarbonCredits(creditsData);
                document.getElementById('carbon-credits-content').innerHTML = creditsHTML;
                
                /**
                 * DISPLAY RESULTS
                 */
                
                // Show all result sections
                UI.showElement('results');
                UI.showElement('comparison');
                UI.showElement('carbon-credits');
                
                // Scroll smoothly to results section
                UI.scrollToElement('results');
                
                // Hide loading state and restore button
                UI.hideLoading(submitButton);
                
                // Log success to console
                console.log('✅ Cálculo concluído:', {
                    emission: emission,
                    credits: carbonCredits,
                    savings: savings
                });
                
            } catch (error) {
                /**
                 * ERROR HANDLING
                 */
                
                // Log error details to console for debugging
                console.error('❌ Erro ao calcular emissões:', error);
                
                // Show user-friendly error message
                alert('❌ Ocorreu um erro ao calcular as emissões. Por favor, tente novamente.');
                
                // Hide loading state
                UI.hideLoading(submitButton);
            }
            
        }, 1500); // 1.5 second delay to simulate processing
    }
    
});