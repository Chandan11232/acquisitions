import app from './app.js';

const PORT = process.env.PORT || 3000;
console.log(app);

app.listen(PORT, () => {
  console.log('Listening on http://localhost:3000');
});
