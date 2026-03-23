export function calculateDynamicPrice(product, allMetalRates = []) {
  try {
    const toNum = (val) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === "number") return Number.isFinite(val) ? val : 0;
      const cleaned = String(val).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
      return cleaned ? Number(cleaned[0]) : 0;
    };

    // Parse productSummary safely
    let summaryObj = {};
    try {
      if (typeof product.productSummary === "string") {
        summaryObj = JSON.parse(product.productSummary) || {};
      } else if (Array.isArray(product.productSummary)) {
        summaryObj = product.productSummary.reduce((acc, item) => {
          if (item?.key) acc[item.key] = item.value;
          return acc;
        }, {});
      } else if (typeof product.productSummary === "object") {
        summaryObj = product.productSummary || {};
      }
    } catch (e) {}

    const readKey = (obj, ...keys) => {
      const lower = Object.fromEntries(Object.entries(obj).map(([k, v]) => [String(k).toLowerCase(), v]));
      for (const k of keys) {
        if (lower[k.toLowerCase()] !== undefined) return String(lower[k.toLowerCase()]);
      }
      return "";
    };

    const weightStr = (readKey(summaryObj, "metalWeight", "metal weight", "weight", "net weight", "gold weight") || product.metalWeight || "").toString().trim();
    const weightMatch = weightStr.match(/(\d+(\.\d+)?)/);
    let weight = weightMatch ? parseFloat(weightMatch[0]) : 0;
    let rate = 0;

    // Available Metals
    let pricedMetalOptions = [];
    try {
      if (product.availableMetals) {
        const metals = typeof product.availableMetals === "string" ? JSON.parse(product.availableMetals) : product.availableMetals;
        if (Array.isArray(metals)) {
          pricedMetalOptions = metals;
        }
      }
    } catch (e) {}

    // Determine base rate
    if (pricedMetalOptions.length > 0) {
       // Usually the first one is default
       const defaultMetal = pricedMetalOptions[0];
       if (defaultMetal.rate) rate = toNum(defaultMetal.rate);
       else if (defaultMetal.metalRateId) {
          const byId = allMetalRates.find(r => String(r.id) === String(defaultMetal.metalRateId));
          if (byId) rate = toNum(byId.rate);
       }
       if (rate === 0) {
          const needle = `${defaultMetal.name || ""} ${defaultMetal.id || ""}`.toLowerCase();
          const byName = allMetalRates.find(r => {
             const rn = String(r.name || "").toLowerCase();
             return rn && (needle.includes(rn) || rn.includes(needle));
          });
          if (byName) rate = toNum(byName.rate);
       }
       if (defaultMetal.metalWeight) {
          const vWeightMatch = String(defaultMetal.metalWeight).match(/(\d+(\.\d+)?)/);
          if (vWeightMatch) weight = parseFloat(vWeightMatch[0]);
       }
    } else if (product.metalRate && product.metalRate.rate) {
      rate = toNum(product.metalRate.rate);
    } else {
      const metalDetail = JSON.stringify(product.metalDetails || "").toLowerCase();
      if (metalDetail.includes("gold") || String(product.name).toLowerCase().includes("gold")) {
         const goldRate = allMetalRates.find(r => r.name.toLowerCase().includes("gold"));
         rate = goldRate ? toNum(goldRate.rate) : 0;
      } else if (metalDetail.includes("silver") || String(product.name).toLowerCase().includes("silver")) {
         const silverRate = allMetalRates.find(r => r.name.toLowerCase().includes("silver"));
         rate = silverRate ? toNum(silverRate.rate) : 0;
      }
      if (rate === 0 && allMetalRates.length > 0) {
         rate = toNum(allMetalRates[0].rate);
      }
    }

    let fixedDiamondCost = 0;
    try {
      const diamonds = typeof product.availableDiamonds === "string" ? JSON.parse(product.availableDiamonds) : product.availableDiamonds;
      if (Array.isArray(diamonds) && diamonds.length > 0) {
         let dRate = toNum(diamonds[0].diamondRate);
         let dWeight = toNum(diamonds[0].diamondWeight);
         fixedDiamondCost = Math.max(dRate * dWeight, 0);
      }
    } catch (e) {}

    let makingPercent = toNum(product.makingCharges);
    let taxPercentage = toNum(product.taxRate);

    // Other charges
    let otherCharges = 0;
    try {
      const otherDetailsStr = typeof product.otherDetails === 'string' ? JSON.parse(product.otherDetails) : product.otherDetails;
      if (Array.isArray(otherDetailsStr)) {
        for (const item of otherDetailsStr) {
          const key = item?.key || item?.label || "";
          if (/other|hallmark|certificate|certification|wastage|setting/i.test(String(key))) {
             otherCharges += toNum(item.value || item.amount);
          }
        }
      } else if (typeof otherDetailsStr === 'object' && otherDetailsStr !== null) {
         for(const [k, v] of Object.entries(otherDetailsStr)) {
            if (/other|hallmark|certificate|certification|wastage|setting/i.test(String(k))) {
              otherCharges += toNum(v);
            }
         }
      }
    } catch(e){}
    
    if (otherCharges === 0 && toNum(product.otherCharges) > 0) {
      otherCharges = toNum(product.otherCharges);
    }

    const calculatedMetalCost = Math.max(weight, 0) * Math.max(rate, 0);
    const currentMakingCharges = (calculatedMetalCost * makingPercent) / 100;
    
    const subtotalBeforeTax = calculatedMetalCost + fixedDiamondCost + currentMakingCharges + otherCharges;
    const calculatedTaxAmount = (subtotalBeforeTax * taxPercentage) / 100;
    const calculatedFinalPrice = Math.round(subtotalBeforeTax + calculatedTaxAmount);

    if (calculatedFinalPrice > 0) return calculatedFinalPrice;
    return toNum(product.price);
  } catch (err) {
    console.error("Price compute error: ", err);
    return product.price; // fallback
  }
}
