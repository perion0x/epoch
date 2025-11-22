/**
 * Debug endpoint to test Walrus storage directly
 */

import { NextResponse } from 'next/server';
import { config } from '@/config/environment';

export async function GET() {
  try {
    const testContent = 'Debug test from Vercel';
    const contentBytes = new TextEncoder().encode(testContent);
    
    const url = `${config.walrus.publisherUrl}/v1/blobs?epochs=5`;
    
    console.log('🧪 Testing Walrus store...');
    console.log('📡 URL:', url);
    console.log('📦 Content size:', contentBytes.length);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: contentBytes,
    });
    
    console.log('📊 Response status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Walrus store failed',
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        url,
      }, { status: 500 });
    }
    
    const result = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      blobId: result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId,
      fullResponse: result,
      url,
    });
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
