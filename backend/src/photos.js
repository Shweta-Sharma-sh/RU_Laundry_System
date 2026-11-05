// photos.js
// ---------
// Saving a photo a student uploaded.
//
// The frontend sends photos as data URLs ("data:image/jpeg;base64,...").
// We check that it really is an image and not too big, then keep it in the
// photos table together with the student who owns it.

import { ApiError } from "./errors.js";
import { MAX_PHOTO_LENGTH } from "./config.js";
import { makeId } from "./time.js";
import { query } from "./db.js";

/** kind = "REFERENCE" (private) or "COMPLAINT_EVIDENCE". Returns the new photo id. */
export async function savePhoto(studentId, kind, dataUrl) {
  if (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(dataUrl)) {
    throw new ApiError(400, "Please upload a PNG, JPEG or WebP image.");
  }
  if (dataUrl.length > MAX_PHOTO_LENGTH) {
    throw new ApiError(413, "The photo is too large. Please choose a smaller one.");
  }

  const id = makeId("photo");
  await query(
    "INSERT INTO photos (id, student_id, kind, data_url) VALUES ($1, $2, $3, $4)",
    [id, studentId, kind, dataUrl],
  );
  return id;
}
