require('./dns-patch');
require('dotenv').config();
console.log('modules loaded, calling connectDB...');
const connectDB = require('./config/db');
connectDB().then(() => {
  console.log('connectDB resolved');
  process.exit(0);
}).catch(err => {
  console.error('connectDB rejected:', err.message);
  process.exit(1);
});
