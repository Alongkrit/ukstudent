import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Response } from 'express';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'image/png',
  'image/jpeg',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/x-python',
  'application/javascript',
  'text/javascript',
  'text/html',
  'text/css',
];

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.zip', '.png', '.jpg', '.jpeg',
  '.csv', '.xlsx', '.py', '.js', '.ts', '.cpp', '.java', '.h', '.html', '.css'
];

@Injectable()
export class UploadService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processAndSaveFile(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds maximum allowed limit of 25MB.');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`File format '${ext || file.mimetype}' is not permitted.`);
    }

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const sanitizedBase = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storageKey = `${Date.now()}_${uniqueId}_${sanitizedBase}`;
    const filePath = path.join(this.uploadDir, storageKey);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      fileUrl: `/api/v1/uploads/${storageKey}`,
      fileName: file.originalname,
      storageKey,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  async serveFile(storageKey: string, res: Response) {
    const sanitizedKey = path.basename(storageKey);
    const filePath = path.join(this.uploadDir, sanitizedKey);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Requested file was not found.');
    }

    res.sendFile(filePath);
  }

  async deleteFile(storageKey: string) {
    if (!storageKey) return;
    const sanitizedKey = path.basename(storageKey);
    const filePath = path.join(this.uploadDir, sanitizedKey);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Failed to delete file from disk:', err);
      }
    }
  }
}
