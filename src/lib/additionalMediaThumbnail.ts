/** Media types that have width/height (raster + SVG) - mirrors
 *  rms-media-plugin's isImageType (data/rms-media-plugin-main). */
export function isImageType(mediaType: string): boolean {
  return ["image", "svg", "icon", "banner", "background", "logo", "gallery"].includes(
    mediaType
  );
}

function splitQuery(url: string): [string, string] {
  const q = url.indexOf("?");
  return q === -1 ? [url, ""] : [url.slice(0, q), url.slice(q)];
}

/**
 * Derives the smallest-variant thumbnail URL for an additional-media image so
 * the list renders a few kilobytes instead of the multi-megabyte original.
 * Ported from rms-media-plugin's get-thumbnail-url.ts (data/rms-media-plugin-main)
 * to keep this app's own list in sync with how its admin UI does it.
 *
 * The media Lambda writes the original to `.../original/{file}.{originalExt}`
 * and each width variant to `.../w{width}/{file}.{variantExt}`. A webp
 * original's variants stay webp (folder swap only); any other original's
 * variants are always `.jpeg`, so the extension has to be rewritten too.
 *
 * `mediaWidthArray` is empty/absent for vectors, files, or external-URL
 * imports that never went through the Lambda - those return `s3Url` as-is.
 */
export function getThumbnailUrl(
  s3Url: string,
  mediaWidthArray: number[] | null | undefined
): string {
  if (!s3Url || !mediaWidthArray || mediaWidthArray.length === 0) {
    return s3Url;
  }
  if (!s3Url.includes("/original/")) {
    return s3Url;
  }

  const smallest = Math.min(...mediaWidthArray);
  const variantFolderUrl = s3Url.replace("/original/", `/w${smallest}/`);

  const [path, query] = splitQuery(variantFolderUrl);
  const dot = path.lastIndexOf(".");
  if (dot <= 0) {
    return variantFolderUrl;
  }
  const ext = path.slice(dot + 1).toLowerCase();
  if (ext === "webp") {
    return variantFolderUrl;
  }
  return `${path.slice(0, dot)}.jpeg${query}`;
}
