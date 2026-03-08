import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_BASE_HOSTNAME = new URL(API_BASE_URL).hostname;
const TRUSTED_HOSTNAMES = new Set([
  API_BASE_HOSTNAME,
  'localhost',
  '127.0.0.1',
  'host.docker.internal',
  'backend',
  'islamic_windows_backend',
]);

function buildCandidateUrls(targetUrl) {
  const url = new URL(targetUrl);
  const candidates = [url.toString()];

  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    const dockerHost = new URL(url.toString());
    dockerHost.hostname = 'host.docker.internal';
    candidates.push(dockerHost.toString());

    const backendService = new URL(url.toString());
    backendService.hostname = 'backend';
    candidates.push(backendService.toString());

    const backendContainer = new URL(url.toString());
    backendContainer.hostname = 'islamic_windows_backend';
    candidates.push(backendContainer.toString());
  }

  return [...new Set(candidates)];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPdfUrl = searchParams.get('pdfUrl');
    const rawFilename = searchParams.get('filename') || 'document.pdf';

    if (!rawPdfUrl) {
      return NextResponse.json({ message: 'pdfUrl is required' }, { status: 400 });
    }

    const safeFilename = rawFilename.replace(/[^\w.\-]+/g, '_');
    const targetUrl = rawPdfUrl.startsWith('http')
      ? rawPdfUrl
      : `${API_BASE_URL}${rawPdfUrl}`;

    const parsedTargetUrl = new URL(targetUrl);
    if (!TRUSTED_HOSTNAMES.has(parsedTargetUrl.hostname)) {
      return NextResponse.json({ message: 'Invalid pdfUrl' }, { status: 400 });
    }

    const candidates = buildCandidateUrls(targetUrl);
    let pdfResponse = null;

    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate);
        if (response.ok) {
          pdfResponse = response;
          break;
        }
      } catch {
        // Try next candidate
      }
    }

    if (!pdfResponse) {
      return NextResponse.json({ message: 'PDF fetch failed' }, { status: 502 });
    }

    const arrayBuffer = await pdfResponse.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Download failed' }, { status: 500 });
  }
}
