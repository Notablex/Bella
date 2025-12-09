import { Logger } from '../utils/logger';
import { config } from '../utils/config';
import fs from 'fs';
import path from 'path';

interface FileUploadResult {
  url: string;
  key?: string;
}

/**
 * Upload file to configured storage (S3 or local)
 */
export async function uploadFile(
  file: { buffer: Buffer; mimetype: string; originalname: string },
  fileName: string,
  logger: Logger
): Promise<string> {
  try {
    if (config.storage.type === 's3') {
      return await uploadToS3(file, fileName, logger);
    } else {
      return await uploadToLocal(file, fileName, logger);
    }
  } catch (error: any) {
    logger.error('File upload failed', error);
    throw new Error('File upload failed');
  }
}

/**
 * Upload file to AWS S3
 */
async function uploadToS3(
  file: { buffer: Buffer; mimetype: string; originalname: string },
  fileName: string,
  logger: Logger
): Promise<string> {
  // For now, we'll implement a local fallback
  // In production, you would use AWS SDK v3:
  // import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
  
  logger.warn('S3 upload not implemented, falling back to local storage');
  return await uploadToLocal(file, fileName, logger);
}

/**
 * Upload file to local storage
 */
async function uploadToLocal(
  file: { buffer: Buffer; mimetype: string; originalname: string },
  fileName: string,
  logger: Logger
): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  
  // Write file to disk
  fs.writeFileSync(filePath, file.buffer);

  // Return URL (in production, this would be your CDN/S3 URL)
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const fileUrl = `${baseUrl}/uploads/${fileName}`;

  logger.info('File uploaded to local storage', {
    fileName,
    filePath,
    fileSize: file.buffer.length,
    mimetype: file.mimetype,
  });

  return fileUrl;
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileUrl: string, logger: Logger): Promise<void> {
  try {
    if (config.storage.type === 's3') {
      await deleteFromS3(fileUrl, logger);
    } else {
      await deleteFromLocal(fileUrl, logger);
    }
  } catch (error: any) {
    logger.error('File deletion failed', error);
    // Don't throw error for deletion failures in non-critical path
  }
}

/**
 * Delete file from AWS S3
 */
async function deleteFromS3(fileUrl: string, logger: Logger): Promise<void> {
  // For now, we'll implement a local fallback
  logger.warn('S3 deletion not implemented, falling back to local deletion');
  await deleteFromLocal(fileUrl, logger);
}

/**
 * Delete file from local storage
 */
async function deleteFromLocal(fileUrl: string, logger: Logger): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const filePath = path.join(process.cwd(), 'uploads', fileName);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File deleted from local storage', { fileName, filePath });
    }
  } catch (error: any) {
    logger.error('Local file deletion failed', error);
    throw error;
  }
}