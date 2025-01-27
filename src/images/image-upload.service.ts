import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from './entities/image.entity.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageUploadService {
  private readonly logger = new Logger('ImageUploadService');

  constructor(
    @InjectModel(Image.name) private imageModel: Model<Image>,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    description?: string,
    resourceType: 'image' | 'video' = 'image',
  ): Promise<Image> {
    const result = await this.uploadToCloudinary(file, resourceType);
    const newMedia = new this.imageModel({
      url: result.secure_url,
      publicId: result.public_id,
      description: description,
    });
    return newMedia.save();
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    resourceType: 'image' | 'video',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            return reject(error);
          }
          resolve(result);
        },
      );
      upload.end(file.buffer);
    });
  }

  async getAllImages(page: number = 1, limit: number = 20): Promise<{ images: Image[], total: number }> {
    const skip = (page - 1) * limit;
    const [images, total] = await Promise.all([
      this.imageModel.find().skip(skip).limit(limit).exec(),
      this.imageModel.countDocuments()
    ]);
    return { images, total };
  }
}