import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name:'dmhuir3hz',
  api_key:'986751963532472',
  api_secret:'oj8bzsnD9uIvI32cS6a3oUYI_M0',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now();
    const userId = req.user?.user_id || 'anonymous';
    const extension = file.originalname.split('.').pop();
    const filename = `${userId}_${file.fieldname}_${timestamp}.${extension}`;

    return {
      folder: 'employee_profiles',
      public_id: filename,
      allowed_formats: ['jpg', 'jpeg', 'png'],
    };
  },
});

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
