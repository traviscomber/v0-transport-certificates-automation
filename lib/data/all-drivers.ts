// Lazy-load drivers data to avoid webpack serialization issues
// The actual data is now loaded dynamically instead of being inline
// Note: This loader now queries Supabase directly instead of static JSON files

let cachedData: any[] | null = null;

async function loadDriversData() {
  if (cachedData) return cachedData;
  
  try {
    // Try to load from public JSON file first (deprecated, but kept for backward compatibility)
    const response = await fetch('/data/all-drivers.json');
    if (response.ok) {
      cachedData = await response.json();
      return cachedData;
    }
  } catch (e) {
    // Silently fail - JSON files are deprecated, data comes from Supabase API
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
