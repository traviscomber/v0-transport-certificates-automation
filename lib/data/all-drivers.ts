// Lazy-load drivers data from API endpoint
// Data is fetched from Supabase via the API, not from static JSON files

let cachedData: any[] | null = null;

async function loadDriversData() {
  if (cachedData) return cachedData;
  
  try {
    // Load from API endpoint that queries Supabase
    const response = await fetch('/api/conductores');
    if (response.ok) {
      const data = await response.json();
      cachedData = data.conductores || data || [];
      return cachedData;
    }
  } catch (e) {
    console.warn('[v0] Failed to load drivers data from API');
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
