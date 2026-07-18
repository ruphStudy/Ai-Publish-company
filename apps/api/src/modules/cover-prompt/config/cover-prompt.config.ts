export const coverPromptConfig = {
  promptVersion: process.env.COVER_PROMPT_VERSION ?? 'v1',
  defaultImageRatio: process.env.COVER_DEFAULT_IMAGE_RATIO ?? '2:3',
  defaultResolution:
    process.env.COVER_DEFAULT_RESOLUTION ?? '1600x2400',
  variationCount: Number(process.env.COVER_VARIATION_COUNT ?? 3),
};