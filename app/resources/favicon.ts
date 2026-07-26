const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Flow Talk">
  <rect width="64" height="64" rx="16" fill="#160f17"/>
  <path fill="#c9366f" d="M29 8C18.5 8 10 16.1 10 26.2c0 5 2.1 9.5 5.5 12.8L12.8 49l10-5.2c2 .7 4.1 1.1 6.2 1.1 10.5 0 19-8.1 19-18.3S39.5 8 29 8Z"/>
  <rect width="21" height="4" x="18.5" y="21" rx="2" fill="#fff7fb"/>
  <rect width="14" height="4" x="18.5" y="29" rx="2" fill="#fff7fb"/>
  <circle cx="49" cy="47" r="7" fill="#f0528a" stroke="#160f17" stroke-width="3"/>
</svg>`.trim();

function loader(): Response {
  return new Response(faviconSvg, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/svg+xml; charset=utf-8"
    }
  });
}

export { loader };
