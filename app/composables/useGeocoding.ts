/**
 * Geocoding Composable
 * Menggunakan Nominatim API (OpenStreetMap) untuk:
 * - Forward Geocoding: cari lokasi dari nama tempat
 * - Reverse Geocoding: dapat alamat dari koordinat
 */

export interface AddressDetails {
  jalan?: string;
  desa?: string;
  kecamatan?: string;
  kelurahan?: string;
  kabupaten_kota?: string;
  provinsi?: string;
  kode_pos?: string;
  alamat_lengkap?: string;
}

export interface NominatimAddress {
  road?: string;
  footway?: string;
  path?: string;
  pedestrian?: string;
  residential?: string;
  village?: string;
  suburb?: string;
  city_district?: string;
  district?: string;
  county?: string;
  city?: string;
  town?: string;
  state?: string;
  postcode?: string;
  display_name?: string;
  country?: string;
  state_district?: string;
  municipality?: string;
}

export interface SearchResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
  boundingbox?: string[];
}

/**
 * Melakukan forward geocoding (cari lokasi dari nama)
 * @param query Nama tempat yang dicari
 * @returns Promise<SearchResult[]> Array hasil pencarian
 */
export async function searchLocation(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query,
      )}&addressdetails=1&limit=5&accept-language=id-ID&countrycodes=id`,
      {
        headers: {
          "User-Agent": "ISCP-Prakerin-App",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to search location");
    }

    const data = await response.json();

    if (data.error) {
      console.error("Nominatim search error:", data.error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
}

/**
 * Melakukan reverse geocoding dari koordinat lat/lng
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise<AddressDetails>
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<AddressDetails | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id-ID`,
      {
        headers: {
          "User-Agent": "ISCP-Prakerin-App",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address");
    }

    const data = await response.json();

    if (data.error) {
      console.error("Nominatim error:", data.error);
      return null;
    }

    const address: NominatimAddress = data.address || {};

    return parseNominatimAddress(address);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Parse response dari Nominatim ke format AddressDetails
 */
function parseNominatimAddress(address: NominatimAddress): AddressDetails {
  const result: AddressDetails = {
    alamat_lengkap: address.display_name,
  };

  // Jalan/Nama Jalan
  result.jalan =
    address.road ||
    address.footway ||
    address.path ||
    address.pedestrian ||
    address.residential ||
    undefined;

  // Desa
  result.desa = address.village || address.suburb || undefined;

  // Kecamatan
  result.kecamatan =
    address.city_district ||
    address.district ||
    address.municipality ||
    undefined;

  // Kelurahan
  result.kelurahan = address.suburb || address.village || undefined;

  // Kabupaten/Kota
  result.kabupaten_kota =
    address.county || address.city || address.town || undefined;

  // Provinsi
  result.provinsi = address.state || undefined;

  // Kode Pos
  result.kode_pos = address.postcode || undefined;

  return result;
}

/**
 * Format alamat lengkap dari komponen alamat
 */
export function formatFullAddress(address: AddressDetails): string {
  const parts: string[] = [];

  if (address.jalan) parts.push(address.jalan);
  if (address.kelurahan) parts.push(`Kel. ${address.kelurahan}`);
  if (address.kecamatan) parts.push(`Kec. ${address.kecamatan}`);
  if (address.kabupaten_kota) parts.push(address.kabupaten_kota);
  if (address.provinsi) parts.push(address.provinsi);
  if (address.kode_pos) parts.push(address.kode_pos);

  return parts.join(", ") || "";
}

/**
 * Composable untuk useGeocoding
 */
export function useGeocoding() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Search location by name
  const search = async (query: string): Promise<SearchResult[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const results = await searchLocation(query);
      return results;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Terjadi kesalahan";
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Get address from coordinates
  const reverseCode = async (
    lat: number,
    lng: number,
  ): Promise<AddressDetails | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await reverseGeocode(lat, lng);
      if (!result) {
        error.value = "Gagal mendapatkan alamat dari koordinat";
      }
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Terjadi kesalahan";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    search,
    reverseCode,
  };
}
