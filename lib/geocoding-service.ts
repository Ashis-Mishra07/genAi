// Geocoding service for converting addresses to coordinates
export function getCoordinatesFromAddress(address: any): { lat: number; lng: number } | null {
  if (!address) return null;
  
  const city = address?.city?.toLowerCase();
  const state = address?.state?.toLowerCase();
  
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    'cuttack': { lat: 20.4625, lng: 85.8828 },
    'puri': { lat: 19.8135, lng: 85.8312 },
    'berhampur': { lat: 19.3149, lng: 84.7941 },
    'rourkela': { lat: 22.2604, lng: 84.8536 },
    'sambalpur': { lat: 21.4669, lng: 83.9812 },
    'balasore': { lat: 21.4942, lng: 86.9281 },
    'dhenkanal': { lat: 20.6593, lng: 85.5986 },
    'angul': { lat: 20.8397, lng: 85.1018 },
    'jharsuguda': { lat: 21.8697, lng: 84.0036 },
    'rayagada': { lat: 19.1661, lng: 83.4129 },
    'balangir': { lat: 20.7117, lng: 83.4870 },
    'kendrapara': { lat: 20.5004, lng: 86.4221 },
    'jajpur': { lat: 20.8413, lng: 86.3342 },
    'mayurbhanj': { lat: 21.9288, lng: 86.7395 },
    'koraput': { lat: 18.8120, lng: 82.7108 },
    'ganjam': { lat: 19.3900, lng: 84.8800 },
    'khurda': { lat: 20.1809, lng: 85.6142 },
    'nayagarh': { lat: 20.1333, lng: 85.0975 },
    'kalahandi': { lat: 19.9167, lng: 83.1667 }
  };
  
  // First try exact city match
  if (city && cityCoordinates[city]) {
    return cityCoordinates[city];
  }
  
  // If city not found but state is Odisha/Orissa, default to Bhubaneswar
  if (state && (state.includes('odisha') || state.includes('orissa'))) {
    return cityCoordinates['bhubaneswar'];
  }
  
  // Try to extract city from address string if city field is empty
  if (address?.address && typeof address.address === 'string') {
    const addressStr = address.address.toLowerCase();
    for (const [cityName, coords] of Object.entries(cityCoordinates)) {
      if (addressStr.includes(cityName)) {
        return coords;
      }
    }
  }
  
  return null;
}