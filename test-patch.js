require('./dns-patch');
console.log('Testing psResolveSRV...');
const { psResolveSRV } = require('./dns-patch');
try {
  const result = psResolveSRV('_mongodb._tcp.cluster0.t2vy0ki.mongodb.net');
  console.log('Success:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('Error:', e.message);
}
