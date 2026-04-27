/**
 * Calculator - Global calculator object for CO2 emissions
 * Contains all calculation methods for emissions, comparisons, and carbon credits
 */

const Calculator = {
    /**
     * Calculate CO2 emission for a given distance and transport mode
     * @param {number} distanceKm - Distance in kilometers
     * @param {string} transportMode - Transport mode key (bicycle, car, bus, truck)
     * @returns {number} CO2 emission in kilograms, rounded to 2 decimal places
     */
    calculateEmission: function(distanceKm, transportMode) {
        // Get the emission factor for the specified transport mode
        const emissionFactor = CONFIG.EMISSION_FACTORS[transportMode];
        
        // Calculate emission: distance * emission factor
        const emission = distanceKm * emissionFactor;
        
        // Return result rounded to 2 decimal places
        return Math.round(emission * 100) / 100;
    },

    /**
     * Calculate emissions for all transport modes and compare with car as baseline
     * @param {number} distanceKm - Distance in kilometers
     * @returns {Array} Array of objects with mode, emission, and percentage vs car, sorted by emission
     */
    calculateAllModes: function(distanceKm) {
        // Array to store calculation results
        const results = [];
        
        // First, calculate car emission as baseline for comparison
        const carEmission = this.calculateEmission(distanceKm, 'car');
        
        // Calculate emission for each transport mode
        for (const mode in CONFIG.EMISSION_FACTORS) {
            // Calculate emission for this mode
            const emission = this.calculateEmission(distanceKm, mode);
            
            // Calculate percentage compared to car (baseline)
            // Handle edge case where car emission is 0
            const percentageVsCar = carEmission > 0 
                ? Math.round((emission / carEmission) * 100 * 100) / 100
                : 0;
            
            // Add result object to array
            results.push({
                mode: mode,
                emission: emission,
                percentageVsCar: percentageVsCar
            });
        }
        
        // Sort array by emission (lowest first for eco-friendly ranking)
        results.sort((a, b) => a.emission - b.emission);
        
        return results;
    },

    /**
     * Calculate CO2 savings compared to a baseline emission
     * @param {number} emission - Current emission in kg CO2
     * @param {number} baselineEmission - Baseline emission to compare against in kg CO2
     * @returns {Object} Object with savedKg and percentage properties
     */
    calculateSavings: function(emission, baselineEmission) {
        // Calculate how many kg of CO2 were saved
        const savedKg = baselineEmission - emission;
        
        // Calculate percentage of savings
        // Handle edge case where baseline is 0
        const percentage = baselineEmission > 0
            ? (savedKg / baselineEmission) * 100
            : 0;
        
        // Return object with rounded values
        return {
            savedKg: Math.round(savedKg * 100) / 100,
            percentage: Math.round(percentage * 100) / 100
        };
    },

    /**
     * Calculate carbon credits needed to offset the emission
     * @param {number} emissionKg - CO2 emission in kilograms
     * @returns {number} Number of carbon credits needed, rounded to 4 decimal places
     */
    calculateCarbonCredits: function(emissionKg) {
        // Each carbon credit offsets a certain amount of CO2 (defined in CONFIG)
        const credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
        
        // Return rounded to 4 decimal places for precision
        return Math.round(credits * 10000) / 10000;
    },

    /**
     * Estimate the price range for carbon credits in Brazilian Reais
     * @param {number} credits - Number of carbon credits
     * @returns {Object} Object with min, max, and average price in BRL
     */
    estimateCreditPrice: function(credits) {
        // Calculate minimum price based on low market rate
        const min = credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
        
        // Calculate maximum price based on high market rate
        const max = credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;
        
        // Calculate average price (midpoint of range)
        const average = (min + max) / 2;
        
        // Return object with all prices rounded to 2 decimal places
        return {
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100,
            average: Math.round(average * 100) / 100
        };
    }
};