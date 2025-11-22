/**
 * Content compression utilities
 * Implements Task 11.3 - Add content compression
 * 
 * Features:
 * - Compress content before encryption
 * - Decompress after decryption
 * - Use efficient serialization
 */

/**
 * Compress data using the Compression Streams API
 * Supported in modern browsers
 */
export async function compress(data: Uint8Array): Promise<Uint8Array> {
  try {
    // Check if CompressionStream is available
    if (typeof CompressionStream === 'undefined') {
      console.warn('CompressionStream not available, returning uncompressed data');
      return data;
    }

    const stream = new Blob([data]).stream();
    const compressedStream = stream.pipeThrough(
      new CompressionStream('gzip')
    );

    const compressedBlob = await new Response(compressedStream).blob();
    const compressedArray = new Uint8Array(await compressedBlob.arrayBuffer());

    return compressedArray;
  } catch (error) {
    console.error('Compression failed:', error);
    // Return original data if compression fails
    return data;
  }
}

/**
 * Decompress data using the Decompression Streams API
 */
export async function decompress(data: Uint8Array): Promise<Uint8Array> {
  try {
    // Check if DecompressionStream is available
    if (typeof DecompressionStream === 'undefined') {
      console.warn('DecompressionStream not available, returning data as-is');
      return data;
    }

    const stream = new Blob([data]).stream();
    const decompressedStream = stream.pipeThrough(
      new DecompressionStream('gzip')
    );

    const decompressedBlob = await new Response(decompressedStream).blob();
    const decompressedArray = new Uint8Array(await decompressedBlob.arrayBuffer());

    return decompressedArray;
  } catch (error) {
    console.error('Decompression failed:', error);
    // Return original data if decompression fails
    return data;
  }
}

/**
 * Compress text content
 */
export async function compressText(text: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return compress(data);
}

/**
 * Decompress to text content
 */
export async function decompressText(data: Uint8Array): Promise<string> {
  const decompressed = await decompress(data);
  const decoder = new TextDecoder();
  return decoder.decode(decompressed);
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Compression statistics
 */
export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
}

/**
 * Get compression statistics
 */
export function getCompressionStats(
  originalData: Uint8Array,
  compressedData: Uint8Array
): CompressionStats {
  const originalSize = originalData.length;
  const compressedSize = compressedData.length;
  const ratio = getCompressionRatio(originalSize, compressedSize);

  return {
    originalSize,
    compressedSize,
    ratio,
    originalSizeFormatted: formatBytes(originalSize),
    compressedSizeFormatted: formatBytes(compressedSize),
  };
}
