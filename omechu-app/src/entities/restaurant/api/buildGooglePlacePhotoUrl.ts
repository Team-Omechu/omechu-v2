export function buildGooglePlacePhotoUrl(args: {
  photoName: string;
  apiKey: string;
  maxWidthPx?: number;
  maxHeightPx?: number;
}): string {
  const { photoName, apiKey, maxWidthPx = 400, maxHeightPx = 400 } = args;

  // photoName 예: "places/ChIJ.../photos/AdCG2..." (슬래시 포함)
  // v1 media endpoint: /v1/{photoName}/media
  const base = `https://places.googleapis.com/v1/${photoName}/media`;
  const qs = new URLSearchParams({
    key: apiKey,
    maxWidthPx: String(maxWidthPx),
    maxHeightPx: String(maxHeightPx),
  });

  return `${base}?${qs.toString()}`;
}
