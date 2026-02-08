export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Serve static files from .next/static
    if (pathname.startsWith('/_next/')) {
      const filePath = `.${pathname}`;
      try {
        const asset = await import.meta.env.ASSETS.get(filePath);
        if (asset) {
          return new Response(asset, {
            headers: {
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Content-Type': 'application/javascript',
            },
          });
        }
      } catch (e) {
        // fallthrough
      }
    }

    // Serve public assets
    if (pathname !== '/' && !pathname.includes('.')) {
      try {
        const asset = await import.meta.env.ASSETS.get(`.${pathname}`);
        if (asset) {
          return new Response(asset);
        }
      } catch (e) {
        // fallthrough
      }
    }

    // Serve index.html for root and all routes (SPA mode for Next.js)
    try {
      const html = await import.meta.env.ASSETS.get('./index.html');
      if (html) {
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    } catch (e) {
      // fallthrough
    }

    return new Response('Not found', { status: 404 });
  },
};
