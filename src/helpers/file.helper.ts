import { MediaType } from '@prisma/client';
import { CreateMediaDto } from 'src/modules/app/media/dto';
import * as multer from 'multer';

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/files');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const uploadFile = file.originalname.split('.');
    const name = `${uniqueSuffix}.${uploadFile[uploadFile.length - 1]}`;
    cb(null, name);
  },
});

export async function getFileData(
  file: Express.Multer.File,
): Promise<CreateMediaDto> {
  const path = `${process.env.APP_URL}/${file.filename}`;
  const fileType = file.mimetype;
  const fileData: CreateMediaDto = {
    type: MediaType.FILE,
    path: path,
    originalName: file.originalname,
    encoding: file.encoding,
    size: file.size,
    fileName: file.filename,
  };
  if (fileType.match(`application`)) {
    fileData.type = MediaType.FILE;
  } else if (fileType.match(`image`)) {
    fileData.type = MediaType.IMAGE;
  } else if (fileType.match(`video`)) {
    fileData.type = MediaType.VIDEO;
  } else if (fileType.match(`audio`)) {
    fileData.type = MediaType.AUDIO;
  }
  return fileData;
}
