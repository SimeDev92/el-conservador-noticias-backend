import { Controller, Post, Get, UseInterceptors, UploadedFile, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadService } from './image-upload.service';

@Controller('upload')
export class ImageUploadController {
  constructor(private readonly imageUploadService: ImageUploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string
  ) {
    try {
      const image = await this.imageUploadService.uploadFile(file, description);
      return { imageUrl: image.url, publicId: image.publicId };
    } catch (error) {
      throw new Error('Error uploading image');
    }
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ) {
    try {
      const video = await this.imageUploadService.uploadFile(file, description, 'video');
      return { videoUrl: video.url, publicId: video.publicId };
    } catch (error) {
      throw new Error('Error uploading video');
    }
  }

  @Get('images')
  async getAllImages(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.imageUploadService.getAllImages(page, limit);
  }
}