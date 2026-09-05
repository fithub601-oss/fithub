require('./dns-patch');
require('dotenv').config();
const connectDB = require('./config/db');
const { runReminders } = require('./services/reminderService');

(async () => {
  try {
    await connectDB();
    const result = await runReminders({ dryRun: true });
    console.log('DRY RUN RESULT:', result);
  } catch (error) {
    console.error('TEST ERROR:', error.message);
  } finally {
    process.exit(0);
  }
})();