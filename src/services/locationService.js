// Location Master Data Service — API Ready Architecture with Caching
// Enterprise Location Hierarchy: State -> District -> Mandal for DS PROJECTS

import { 
  AP_STATE, 
  AP_DISTRICTS_DATA, 
  AP_DISTRICT_MANDAL_MAP, 
  AP_ALL_MANDALS_FLAT 
} from '../data/andhraPradeshMasterData';

// Memory Cache to prevent repeated redundant requests
const _cache = {
  states: null,
  districts: null,
  mandalsByDistrict: new Map(),
};

function _delay(ms = 80) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const locationService = {
  /**
   * Fetch all active states (Default: Andhra Pradesh)
   * API Route: GET /api/states
   */
  async getStates() {
    if (_cache.states) return _cache.states;
    await _delay(50);
    const result = [{ ...AP_STATE }];
    _cache.states = result;
    return result;
  },

  /**
   * Fetch all 28 current administrative districts of Andhra Pradesh
   * API Route: GET /api/districts?state_id=...
   */
  async getDistricts(stateId = 'AP-STATE-01') {
    if (_cache.districts) return _cache.districts;
    await _delay(80);
    const result = AP_DISTRICTS_DATA.map(d => ({
      id: d.id,
      stateId: 'AP-STATE-01',
      name: d.name,
      code: d.code,
      headquarters: d.headquarters,
      mandalCount: d.mandals.length,
      status: 'active',
    }));
    _cache.districts = result;
    return result;
  },

  /**
   * Synchronous district list for immediate form rendering
   */
  getDistrictsSync() {
    return AP_DISTRICTS_DATA.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      headquarters: d.headquarters,
      mandalCount: d.mandals.length,
    }));
  },

  /**
   * Fetch all mandals for a specific district (by district ID or District Name)
   * API Route: GET /api/districts/:districtId/mandals
   */
  async getMandalsByDistrict(districtIdOrName) {
    if (!districtIdOrName) return [];

    const cacheKey = districtIdOrName.trim().toLowerCase();
    if (_cache.mandalsByDistrict.has(cacheKey)) {
      return _cache.mandalsByDistrict.get(cacheKey);
    }

    await _delay(60);

    // Find district by name or ID
    const districtObj = AP_DISTRICTS_DATA.find(
      d => d.id.toLowerCase() === cacheKey || d.name.toLowerCase() === cacheKey
    );

    if (!districtObj) {
      return [];
    }

    const mandals = districtObj.mandals.map((mandalName, idx) => ({
      id: `AP-${districtObj.code}-M${String(idx + 1).padStart(3, '0')}`,
      districtId: districtObj.id,
      districtName: districtObj.name,
      name: mandalName,
      code: `${districtObj.code}-${mandalName.substring(0, 3).toUpperCase()}`,
      status: 'active',
    }));

    _cache.mandalsByDistrict.set(cacheKey, mandals);
    return mandals;
  },

  /**
   * Synchronous mandal list for immediate lookup
   */
  getMandalsSync(districtName) {
    if (!districtName) return [];
    return AP_DISTRICT_MANDAL_MAP[districtName] || [];
  },

  /**
   * Global search across all districts and mandals
   * Useful for global search bar & quick filtering
   */
  async searchLocations(query = '') {
    if (!query || query.trim().length < 2) return [];
    await _delay(40);
    const q = query.trim().toLowerCase();

    const matchedDistricts = AP_DISTRICTS_DATA
      .filter(d => d.name.toLowerCase().includes(q) || d.headquarters.toLowerCase().includes(q))
      .map(d => ({ type: 'district', ...d }));

    const matchedMandals = AP_ALL_MANDALS_FLAT
      .filter(m => m.name.toLowerCase().includes(q))
      .slice(0, 15)
      .map(m => ({ type: 'mandal', ...m }));

    return [...matchedDistricts, ...matchedMandals];
  },

  /**
   * Verify if a District-Mandal pair is valid
   */
  isValidDistrictMandal(districtName, mandalName) {
    if (!districtName || !mandalName) return false;
    const mandals = AP_DISTRICT_MANDAL_MAP[districtName];
    return Array.isArray(mandals) && mandals.includes(mandalName);
  },

  /**
   * Get metadata for a district (headquarters, total mandals)
   */
  getDistrictMeta(districtName) {
    if (!districtName) return null;
    return AP_DISTRICTS_DATA.find(d => d.name.toLowerCase() === districtName.toLowerCase()) || null;
  }
};
