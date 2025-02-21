import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Category } from '../enums/news-categories.enum';
import { NewsType } from '../enums/news-types.enum';
import { NewsStatus } from '../enums/news-status.enum';

@Schema()
export class News extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ trim: true })
  imgUrl: string;

  @Prop({ required: true, enum: Category })
  category: Category;

  @Prop({ required: true, enum: NewsType })
  newsType: NewsType;

  @Prop({ type: String, enum: NewsStatus, default: NewsStatus.DRAFT })
  status: NewsStatus;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  views: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);

NewsSchema.index({ title: 'text', content: 'text' });
NewsSchema.index({ date: -1 });
NewsSchema.index({ category: 1, date: -1 });
NewsSchema.index({ status: 1, date: -1 });