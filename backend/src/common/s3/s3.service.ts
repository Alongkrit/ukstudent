import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET_PRIVATE') as string;
    this.client = new S3Client({
      region: this.config.get<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID') as string,
        secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY') as string,
      },
    });
  }

  /**
   * Generates a presigned PUT URL for a private object (SEC-3: MIME
   * allow-list enforced here; malware/AV scanning is a separate follow-up —
   * it needs to run server-side after upload, not at URL-issuance time).
   */
  async createUploadUrl(keyPrefix: string, fileName: string, mimeType: string) {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`File type not allowed: ${mimeType}`);
    }

    const key = `${keyPrefix}/${randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });

    // The bucket is private, so this isn't a browsable link — anything that
    // needs to *display* the file later must mint a fresh signed GET URL.
    const fileUrl = `s3://${this.bucket}/${key}`;

    return { uploadUrl, fileUrl, key };
  }
}