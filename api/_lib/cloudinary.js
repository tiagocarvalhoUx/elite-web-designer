import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = "elite-designer/projects";

export async function uploadBuffer(buffer, mimetype) {
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: FOLDER,
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
  });
  return result.secure_url;
}

export async function uploadDataUri(dataUri) {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: FOLDER,
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
  });
  return result.secure_url;
}

export { cloudinary };
