// Intl.Segmenter type augmentation (available at runtime in all modern browsers,
// but TypeScript's ES2020 lib doesn't include the type declaration)
declare namespace Intl {
  interface SegmenterOptions {
    granularity?: "grapheme" | "word" | "sentence";
  }
  interface SegmentData {
    segment: string;
    index: number;
    isWordLike?: boolean;
  }
  interface Segments {
    [Symbol.iterator](): IterableIterator<SegmentData>;
  }
  class Segmenter {
    constructor(locale?: string, options?: SegmenterOptions);
    segment(input: string): Segments;
  }
}
