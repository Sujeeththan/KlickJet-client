import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    // Get the image data from the request
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Forward the request to the Express.js backend
    const uploadResponse = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ data }),
    });

    // Get the response from the backend
    const uploadResult = await uploadResponse.json();

    // If the backend returned an error, forward it to the client
    if (!uploadResponse.ok) {
      return NextResponse.json(
        { 
          error: uploadResult.message || 'Failed to upload image',
          details: uploadResult.error || uploadResult.details,
        },
        { status: uploadResponse.status }
      );
    }

    // Return the successful upload result
    return NextResponse.json(uploadResult, { status: 200 });
  } catch (error) {
    console.error('Upload API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: Handle DELETE requests for image deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const deleteResponse = await fetch(
      `${API_URL}/api/upload/${encodeURIComponent(publicId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
        },
      }
    );

    const deleteResult = await deleteResponse.json();

    if (!deleteResponse.ok) {
      return NextResponse.json(
        { 
          error: deleteResult.message || 'Failed to delete image',
          details: deleteResult.error || deleteResult.details,
        },
        { status: deleteResponse.status }
      );
    }

    return NextResponse.json(deleteResult, { status: 200 });
  } catch (error) {
    console.error('Delete API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
