/**
 * Debug endpoint to check Walrus configuration
 */

import { NextResponse } from 'next/server';
import { config } from '@/config/environment';

export async function GET() {
  return NextResponse.json({
    publisherUrl: config.walrus.publisherUrl,
    publisherUrlLength: config.walrus.publisherUrl.length,
    publisherUrlBytes: Array.from(config.walrus.publisherUrl).map(c => c.charCodeAt(0)),
    aggregatorUrl: config.walrus.aggregatorUrl,
    fullStoreUrl: `${config.walrus.publisherUrl}/v1/blobs?epochs=5`,
  });
}
