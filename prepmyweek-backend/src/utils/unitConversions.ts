// Volume conversion factors to tablespoons (tbsp)
export const volumeConversionToTbsp = {
  // US customary
  tsp: 1 / 3,
  tbsp: 1,
  "fl oz": 2,
  cup: 16,
  pint: 32,
  quart: 64,
  gallon: 256,

  // Metric (1 tbsp = 14.7868 ml)
  ml: 1 / 14.7868, // ~0.0676
  l: 1000 / 14.7868, // ~67.628
};

// Weight conversion factors to ounces (oz)
export const weightConversionToOz = {
  // US customary
  oz: 1,
  lb: 16,

  // Metric (1 oz = 28.3495 g)
  g: 1 / 28.3495, // ~0.03527
  kg: 1000 / 28.3495, // ~35.274
};

// Define which units are count-based (non-convertible)
const countUnits = new Set([
  "whole",
  "clove",
  "stalk",
  "package",
  "slice",
  "bunch",
  "fillet",
  "pinch",
]);

// Conversion constants for metric display
const tbspToMl = 14.7868;
const ozToG = 28.3495;

function roundToFraction(value, unit) {
  const fractions = {
    tbsp: 0.25,
    tsp: 0.125,
    cup: 0.25, // optional, rarely needed but makes it tidy
  };
  const step = fractions[unit] || 0.01;
  return Math.round(value / step) * step;
}

// Determine unit type
export function getUnitType(unit) {
  unit = unit.toLowerCase();
  if (unit in volumeConversionToTbsp) return "volume";
  if (unit in weightConversionToOz) return "weight";
  if (countUnits.has(unit)) return "count";
  return "unknown";
}

// Convert volume to tbsp base unit
export function convertVolumeToTbsp(amount, unit) {
  const factor = volumeConversionToTbsp[unit.toLowerCase()];
  if (!factor) {
    throw new Error(`Unsupported volume unit: ${unit}`);
  }
  return amount * factor;
}

// Convert weight to oz base unit
export function convertWeightToOz(amount, unit) {
  const factor = weightConversionToOz[unit.toLowerCase()];
  if (!factor) {
    throw new Error(`Unsupported weight unit: ${unit}`);
  }
  return amount * factor;
}

// Convert from base volume (tbsp) back to best display unit
export function convertTbspToBestUnit(amount, preferMetric = false) {
  if (preferMetric) {
    let mlAmount = amount * tbspToMl;
    if (mlAmount < 10) {
      mlAmount = Math.round(mlAmount * 10) / 10; // round to 1 decimal place, no big rounding
    } else {
      mlAmount = Math.round(mlAmount / 10) * 10; // round to nearest 10 ml
    }
    // Ensure minimum display amount for very small non-zero values
    if (mlAmount === 0 && amount > 0) {
      mlAmount = 1;
    }
    return {
      amount: mlAmount,
      unit: "ml",
    };
  }

  // Units sorted largest to smallest for display
  const units = [
    { unit: "cup", factor: volumeConversionToTbsp["cup"] },
    { unit: "tbsp", factor: volumeConversionToTbsp["tbsp"] },
    { unit: "tsp", factor: volumeConversionToTbsp["tsp"] },
  ];

  for (const { unit, factor } of units) {
    if (amount >= factor) {
      return {
        amount: roundToFraction(amount / factor, unit),
        unit,
      };
    }
  }
  // fallback to tsp if very small
  return {
    amount: Math.round(amount * 3 * 100) / 100, // convert tbsp -> tsp by multiplying by 3
    unit: "tsp",
  };
}

// Convert from base weight (oz) back to best display unit
export function convertOzToBestUnit(amount, preferMetric = false) {
  if (preferMetric) {
    const grams = Math.round((amount * ozToG) / 5) * 5; // round to nearest 5g
    if (grams >= 1000) {
      return {
        amount: Math.round((grams / 1000) * 100) / 100, // 2 decimals kg
        unit: "kg",
      };
    }
    return {
      amount: grams,
      unit: "g",
    };
  }

  // Units sorted largest to smallest for display (imperial)
  const units = [
    { unit: "lb", factor: weightConversionToOz["lb"] },
    { unit: "oz", factor: weightConversionToOz["oz"] },
  ];

  for (const { unit, factor } of units) {
    if (amount >= factor) {
      return {
        amount: Math.round((amount / factor) * 100) / 100,
        unit,
      };
    }
  }
  return { amount, unit: "oz" };
}

export function pluralizeUnit(unit, amount) {
  if (!unit) return "";

  const normalized = unit.toLowerCase();

  // Skip pluralization for metric units
  if (["ml", "g"].includes(normalized)) {
    return unit; // always singular, no "s"
  }

  const isPlural = Math.abs(amount - 1) > 0.01;

  // Map of known plural forms
  const customPlurals = {
    whole: "whole",
    clove: "cloves",
    stalk: "stalks",
    package: "packages",
    slice: "slices",
    slices: "slices", // just in case
    bunch: "bunches",
    filet: "filets",
    pinch: "pinches",
  };

  // Use raw unit if not plural
  if (!isPlural) return unit;

  // Return known plural or fallback to adding "s"
  return customPlurals[normalized] || unit + "s";
}
