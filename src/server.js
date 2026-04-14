import app from './app.js';

const PORT = process.env.PORT || 3000;

console.log('--- DEBUG START ---');
console.log('Is App Defined?:', !!app);

try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 SUCCESS! Listening on http://localhost:${PORT}`);
  });

  server.on('error', e => {
    console.error('❌ SERVER ERROR:', e);
  });
} catch (err) {
  console.error('❌ CRITICAL CATCH:', err);
}

console.log('--- DEBUG END ---');
