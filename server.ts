import app from './app';
const PORT = process.env.PORT_SERVICE;

app.listen(PORT, () => {
  console.log('=======================================================');
  console.log(`==    N3Y SERVICE listening on port: ${PORT}     ==`);
  console.log('=======================================================');
});
