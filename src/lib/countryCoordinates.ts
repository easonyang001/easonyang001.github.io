/**
 * Approximate [longitude, latitude] centroids for placing a dot on the
 * About page's network map. Not surveying-grade -- close enough to read
 * as "that country" at map scale. Add more as the team grows.
 */
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  Taiwan: [120.9605, 23.6978],
  "United States": [-98.5795, 39.8283],
  Canada: [-106.3468, 56.1304],
  "United Kingdom": [-3.436, 55.3781],
  Ireland: [-8.2439, 53.4129],
  France: [2.2137, 46.2276],
  Germany: [10.4515, 51.1657],
  Netherlands: [5.2913, 52.1326],
  Belgium: [4.4699, 50.5039],
  Switzerland: [8.2275, 46.8182],
  Austria: [14.5501, 47.5162],
  Spain: [-3.7492, 40.4637],
  Portugal: [-8.2245, 39.3999],
  Italy: [12.5674, 41.8719],
  Sweden: [18.6435, 60.1282],
  Norway: [8.4689, 60.472],
  Denmark: [9.5018, 56.2639],
  Finland: [25.7482, 61.9241],
  Poland: [19.1451, 51.9194],
  "Czech Republic": [15.473, 49.8175],
  Greece: [21.8243, 39.0742],
  Japan: [138.2529, 36.2048],
  "South Korea": [127.7669, 35.9078],
  China: [104.1954, 35.8617],
  "Hong Kong": [114.1694, 22.3193],
  Singapore: [103.8198, 1.3521],
  India: [78.9629, 20.5937],
  Israel: [34.8516, 31.0461],
  "United Arab Emirates": [53.8478, 23.4241],
  Australia: [133.7751, -25.2744],
  "New Zealand": [174.886, -40.9006],
  Brazil: [-51.9253, -14.235],
  Mexico: [-102.5528, 23.6345],
  Argentina: [-63.6167, -38.4161],
  Chile: [-71.543, -35.6751],
  "South Africa": [22.9375, -30.5595],
  Egypt: [30.8025, 26.8206],
  Nigeria: [8.6753, 9.082],
  Kenya: [37.9062, -0.0236],
  Thailand: [100.9925, 15.87],
  Vietnam: [108.2772, 14.0583],
  Malaysia: [101.9758, 4.2105],
  Indonesia: [113.9213, -0.7893],
  Philippines: [121.774, 12.8797],
};

export function getCountryCoordinates(country: string | null | undefined): [number, number] | null {
  if (!country) return null;
  return COUNTRY_COORDINATES[country] ?? null;
}
