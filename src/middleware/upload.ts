import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Crear carpetas si no existen
const uploadsDir = path.join(process.cwd(), 'uploads');
const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');
const cvsDir = path.join(uploadsDir, 'cvs');

[uploadsDir, profilePicturesDir, cvsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración para fotos de perfil
const profilePictureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profilePicturesDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

// Configuración para CVs
const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, cvsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  },
});

// Filtros de archivos
const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)'));
  }
};

const documentFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o Word (PDF, DOC, DOCX)'));
  }
};

// Middlewares de multer
export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

export const uploadCV = multer({
  storage: cvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: documentFilter,
});

// Función helper para obtener la URL del archivo
export const getFileUrl = (filename: string, type: 'profile' | 'cv'): string => {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const folder = type === 'profile' ? 'profile-pictures' : 'cvs';
  return `${baseUrl}/uploads/${folder}/${filename}`;
};

// Función helper para eliminar archivo
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

