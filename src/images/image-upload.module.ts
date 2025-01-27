import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageUploadController } from './image-upload.controller';
import { ImageUploadService } from './image-upload.service';
import { memoryStorage } from 'multer';
import { Image, ImageSchema } from './entities/image.entity.schema';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  controllers: [ImageUploadController],
  providers: [ImageUploadService],
  exports: [ImageUploadService], 
})
export class ImageUploadModule {}