import {
  getUnitType,
  convertTbspToBestUnit,
  convertOzToBestUnit,
  pluralizeUnit,
} from "./unitConversions.js";

const sectionLabels = {
  DAIRY: "Dairy Aisle",
  BEVERAGE: "Beverages",
  DELI: "Deli Aisle",
  BREAKFAST: "Breakfast",
  MEAT_SEAFOOD: "Meat & Seafood Aisle",
  BAKING: "Bread or Bakery Aisle",
  CHEESE: "Cheese Aisle",
  CANNED: "Canned Goods",
  DRY_GOOD: "Dry Goods",
  SNACK: "Snack Aisle",
  PRODUCE: "Produce Section",
  FROZEN: "Frozen Foods",
  INTERNATIONAL: "International Foods",
  SPICES: "Spice Aisle",
  OTHER: "Other",
};

function formatSectionName(raw) {
  return sectionLabels[raw] || raw;
}

/**
 * Aggregates ingredients from multiple recipes:
 * - sums normalized quantities by ingredient name + unit
 * - converts summed normalized quantity back to best display unit
 * - pluralizes units
 * - groups by store section
 *
 * @param {Array} recipes - Array of recipes with normalized ingredients
 * @returns {Map<string, Array>} Map keyed by storeSection with array of aggregated ingredients
 */
function getLastWord(str) {
  const words = str.trim().toLowerCase().split(" ");
  return words[words.length - 1];
}

export function aggregateIngredients(recipes, options = {}) {
  const { preferMetric = false } = options;
  const grouped = new Map();

  for (const recipe of recipes) {
    if (!Array.isArray(recipe.ingredients)) continue;

    for (const ingredient of recipe.ingredients) {
      const storeSection = ingredient.storeSection || "Other";
      const name = ingredient.ingredient?.name || "Unknown";
      const quantity = ingredient.normalizedQuantity ?? ingredient.quantity;
      const rawUnit = ingredient.normalizedUnit ?? ingredient.unit ?? "";

      if (quantity == null || isNaN(quantity)) {
        console.warn(`Invalid quantity for ingredient ${name}`, ingredient);
        continue;
      }

      if (!grouped.has(storeSection)) {
        grouped.set(storeSection, new Map());
      }

      const sectionMap = grouped.get(storeSection);
      const id = ingredient.ingredient?.id ?? ingredient.id ?? "unknown";
      const key = `${id}-${rawUnit}`;

      if (sectionMap.has(key)) {
        const existing = sectionMap.get(key);
        existing.normalizedQuantity += Number(quantity);
      } else {
        sectionMap.set(key, {
          id,
          name,
          normalizedQuantity: quantity,
          rawUnit,
          storeSection,
        });
      }
    }
  }

  const result = new Map();

  for (const [section, ingredientsMap] of grouped.entries()) {
    const arr = [];

    for (const ingredient of ingredientsMap.values()) {
      const { name, normalizedQuantity, rawUnit, storeSection } = ingredient;

      let displayQuantity = normalizedQuantity;
      let displayUnit = rawUnit;

      try {
        const unitType = getUnitType(rawUnit);
        if (unitType === "volume") {
          const converted = convertTbspToBestUnit(
            normalizedQuantity,
            preferMetric
          );
          displayQuantity = converted.amount;
          displayUnit = converted.unit;
        } else if (unitType === "weight") {
          const converted = convertOzToBestUnit(
            normalizedQuantity,
            preferMetric
          );
          displayQuantity = converted.amount;
          displayUnit = converted.unit;
        }
        // count-based units remain as is
      } catch (err) {
        console.warn(`Conversion error for ingredient ${name}:`, err);
      }

      const pluralUnit = pluralizeUnit(displayUnit, displayQuantity);

      arr.push({
        id: ingredient.id,
        name,
        storeSection,
        quantity: displayQuantity,
        unit: pluralUnit,
      });
    }

    // **Sort arr alphabetically by last word in ingredient name**
    arr.sort((a, b) => {
      const lastWordA = getLastWord(a.name);
      const lastWordB = getLastWord(b.name);
      return lastWordA.localeCompare(lastWordB);
    });

    result.set(formatSectionName(section), arr);
  }

  return result;
}
