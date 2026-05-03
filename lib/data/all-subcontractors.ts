// Lazy-load subcontractors data to avoid webpack serialization issues
// The actual data is now loaded dynamically instead of being inline

let cachedData: any[] | null = null;

async function loadSubcontractorsData() {
  if (cachedData) return cachedData;
  
  try {
    // Try to load from public JSON file first
    const response = await fetch('/data/all-subcontractors.json');
    if (response.ok) {
      cachedData = await response.json();
      return cachedData;
    }
  } catch (e) {
    console.warn('[v0] Could not load subcontractors from JSON');
  }
  
  // Fallback: return empty array if data can't be loaded
  return [];
}

export const allSubcontractorsData: any[] = [];

// Load data on module import if in browser environment
if (typeof window !== 'undefined') {
  loadSubcontractorsData().then(data => {
    allSubcontractorsData.length = 0;
    allSubcontractorsData.push(...data);
  });
}

export { loadSubcontractorsData };
