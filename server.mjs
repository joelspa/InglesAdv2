// Local development/preview only. Vercel serves the generated dist/ directly.
const port = Number(process.env.PORT) || 3000;
if (process.argv.includes('--production')) {
  const { preview } = await import('vite');
  const server = await preview({ preview: { host: '127.0.0.1', port, strictPort: true } });
  server.printUrls();
} else {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port, strictPort: true } });
  await server.listen();
  server.printUrls();
}
