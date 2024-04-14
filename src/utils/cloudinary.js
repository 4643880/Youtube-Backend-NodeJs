import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUD_NAME } from "../constants";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    } else {
      const res = await cloudinary.uploader.upload(
        localFilePath,
        { resource_type: "auto" },
        function (error, result) {
          console.log(`Custom Message From Cloudinary.js: ${result}`);
        }
      );
      console.log(`Cloudinary URL: ${res.url}`);
      return res;
    }
  } catch (error) {
    // e.g if i get error during uploading it will generate corrupted file that i need to delete from server
    fs.unlinkSync(localFilePath); // remove the locally saved temp file as upload operation got failed
  }
};

export { uploadOnCloudinary };
