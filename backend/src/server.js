// server.js
// ---------
// Starts the API.   npm start   (or  npm run dev  to restart on every change)

import app from "./app.js";
import { PORT, QR_SECRET } from "./config.js";

// The QR secret signs every QR code. Without a long, private secret anybody could
// make a fake code, so the server will not start.
if (!QR_SECRET || QR_SECRET.length < 32) {
  console.error("QR_SECRET is missing or too short (it needs at least 32 characters).");
  console.error("Make one with:  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  console.error("and put it in the .env file as  QR_SECRET=...");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`RU Laundry API is running on http://localhost:${PORT}`);
});
