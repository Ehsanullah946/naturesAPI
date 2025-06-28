const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('the uncaught Exception. shoting down... ');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

// const DB = process.env.DATABASE_LOCAL.replace('<DATABSE>',process.env.);

app.listen(3000, 'localhost', () => {
  console.log('app is running');
});

process.on('unhandledRejection', (err) => {
  console.log('the unhandled Rejection. shoting down... ');
  console.log(err.name, err.message);
  process.exit(1);
});
