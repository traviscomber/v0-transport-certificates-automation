// Lazy-load drivers data to avoid webpack serialization issues
// The actual data is now loaded dynamically instead of being inline

let cachedData: any[] | null = null;

async function loadDriversData() {
  if (cachedData) return cachedData;
  
  try {
    // Try to load from public JSON file first
    const response = await fetch('/data/all-drivers.json');
    if (response.ok) {
      cachedData = await response.json();
      return cachedData;
    }
  } catch (e) {
    console.warn('[v0] Could not load drivers from JSON');
  }
  
  // Fallback: return empty array if data can't be loaded
  return [];
}

export const allDriversData: any[] = [];

// Load data on module import if in browser environment
if (typeof window !== 'undefined') {
  loadDriversData().then(data => {
    if (data && data.length > 0) {
      allDriversData.length = 0;
      allDriversData.push(...data);
    }
  });
}

export { loadDriversData };
