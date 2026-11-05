// errors.js
// ---------
// How the API reports a problem.
//
// Throw an ApiError anywhere in a route:
//     throw new ApiError(400, "Choose between 1 and 15 clothes.");
// and the frontend receives:
//     status 400, { "error": "Choose between 1 and 15 clothes." }

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Express error handler. It must be the last app.use() in app.js. */
export function handleErrors(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: error.message });
  }
  // The request body was too big (a very large photo).
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "The photo is too large. Please choose a smaller one." });
  }
  // A unique index stopped a second open request (two clicks at the same time).
  if (error.code === "23505") {
    return res.status(409).json({ error: "You already have an open request." });
  }
  console.error(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
