// server.js
// ---------
// Starts the API.   npm start   (or  npm run dev  to restart on every change)

import app from "./app.js";
import { PORT } from "./config.js";

app.listen(PORT, () => {
  console.log(`RU Laundry API is running on http://localhost:${PORT}`);
});
