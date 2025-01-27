import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Image extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  publicId: string;

  @Prop()
  description: string;

  @Prop({ default: Date.now })
  uploadDate: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);