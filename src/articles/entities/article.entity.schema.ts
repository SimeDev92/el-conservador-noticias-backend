import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ArticleCategory } from '../enums/article-category.enum';
import { ArticleStatus } from '../enums/article-status.enum';
import { ArticleType } from '../enums/article-type.enum';

@Schema({ timestamps: true })
export class Article extends Document {
  @Prop({
    required: true,
    trim: true,
    index: true
  })
  title: string;

  @Prop({ required: true, trim: true })
  subtitle: string;

  @Prop({ required: true, enum: ArticleCategory })
  category: ArticleCategory;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  content: string;

  @Prop({ trim: true, required: false })
  imgUrl: string;

  @Prop({ trim: true, required: false })
  videoUrl: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: String, enum: ArticleStatus, default: ArticleStatus.ACTIVE })
  status: ArticleStatus;

  @Prop({ type: String, enum: ArticleType, required: true })
  articleType: ArticleType;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  views: number;

  @Prop({
    required: true,
    unique: true,
    index: true
  })
  slug: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ title: 'text', subtitle: 'text', content: 'text', tags: 'text' });