import { promises as fsPromises } from 'fs';
import * as path from 'path';

export interface UploadOptions {
  maxSize?: number; // en bytes
  allowedMimeTypes?: string[];
  directory?: string;
  fileNamePrefix?: string;
}

export async function uploadImage(
  file: Express.Multer.File,
  options: UploadOptions = {}
): Promise<{ fileName: string; relativePath: string; fullPath: string }> {
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  const { 
    maxSize = 5 * 1024 * 1024, // 5MB par défaut
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp','application/pdf', 'image/jpg'],
    directory = 'uploads',
    fileNamePrefix = 'image'
  } = options;

  // Vérifier le type de fichier
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Type de fichier non supporté. Types autorisés: ${allowedMimeTypes.join(', ')}`);
  }

  // Vérifier la taille du fichier
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`);
  }

  // Créer le dossier s'il n'existe pas
  const uploadsDir = path.join(process.cwd(), directory);
  try {
    await fsPromises.access(uploadsDir);
  } catch {
    await fsPromises.mkdir(uploadsDir, { recursive: true });
  }

  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const fileExtension = path.extname(file.originalname);
  const fileName = `${fileNamePrefix}_${timestamp}${fileExtension}`;
  const filePath = path.join(uploadsDir, fileName);

  // Sauvegarder le fichier
  await fsPromises.writeFile(filePath, file.buffer);

  const relativePath = `${directory}/${fileName}`;

  return {
    fileName,
    relativePath,
    fullPath: filePath
  };
}

export async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath) return;

  const fullPath = path.join(process.cwd(), imagePath);
  try {
    await fsPromises.access(fullPath);
    await fsPromises.unlink(fullPath);
  } catch {
    // Le fichier n'existe pas ou erreur, on ignore
  }
} 