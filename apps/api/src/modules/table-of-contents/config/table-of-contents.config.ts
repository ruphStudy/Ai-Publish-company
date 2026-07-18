export const tableOfContentsConfig = {
  tocVersion: process.env.TOC_VERSION ?? 'v1',
  wordsPerPage: Number(process.env.TOC_WORDS_PER_PAGE ?? 300),
};