import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity.schema';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ImageUploadService } from 'src/images/image-upload.service';
import slugify from 'slugify';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TelegramService } from '../social/telegram/telegram.service';
import { ConfigService } from '@nestjs/config';
import { FacebookService } from 'src/social/facebook/facebook.service';
import { TwitterService } from 'src/social/twitter/twitter.service';

@Injectable()
export class ArticlesService {

  private readonly logger = new Logger('NewsService');
  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,
    private readonly imageUploadService: ImageUploadService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
    private readonly facebookService: FacebookService,
    private readonly twitterService: TwitterService,

  ) { }

  public frontendUrl = this.configService.get<string>('FRONTEND_URL');

  // Método para generar etiquetas automáticas
  private generateTags(createArticleDto: { title: string; content: string }): string[] {
    const keywords = new Set<string>();

    // Expresión regular para limpiar palabras
    const cleanWord = (word: string) =>
      word.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, '').trim();

    // Lista de palabras comunes para excluir
    const stopWords = new Set([
      'de', 'el', 'la', 'y', 'en', 'con', 'a', 'los', 'del',
      'entre', 'por', 'para', 'sobre', 'sin', 'tras', 'hacia',
      'desde', 'ante', 'bajo', 'cabe', 'según',
      'durante', 'mediante'
    ]);

    // Función para procesar texto
    const processText = (text: string, minLength: number) => {
      text
        .toLowerCase()
        .split(/\s+/) // Dividir por espacios múltiples o simples
        .forEach(word => {
          const cleaned = cleanWord(word); // Limpiar palabra
          if (cleaned.length >= minLength && !stopWords.has(cleaned)) {
            keywords.add(cleaned); // Agregar palabra si no está en stopWords
          }
        });
    };

    // Procesar título y contenido
    processText(createArticleDto.title, 4); // Título: longitud mínima 4
    processText(createArticleDto.content.slice(0, 200), 6); // Contenido: longitud mínima 6

    // Retornar las primeras 5 etiquetas únicas
    return Array.from(keywords).slice(0, 5);
  }

  async createArticle(
    createArticleDto: CreateArticleDto,
    file?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ): Promise<Article> {
    try {
      let videoUrl = createArticleDto.videoUrl || '';
      let imageUrl = createArticleDto.imgUrl || '';

      // Subir imagen
      if (file) {
        const uploadResult = await this.imageUploadService.uploadFile(file);
        imageUrl = uploadResult.url;
      }

      // Subir video
      if (videoFile) {
        const videoResult = await this.imageUploadService.uploadFile(videoFile, undefined, 'video');
        videoUrl = videoResult.url;
      }

      // Generar slug
      let slug = this.generateSlug(createArticleDto.title);
      const existing = await this.articleModel.findOne({ slug });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      // Generar etiquetas automáticas
      const tags = this.generateTags(createArticleDto);

      // Crear nuevo registro
      try {
        const article = await this.articleModel.create({
          ...createArticleDto,
          imgUrl: imageUrl,
          videoUrl: videoUrl,
          slug,
          tags,
        });

      // Publicar en Telegram
      try {
        const telegramText = article.title;
        const telegramSlug = article.slug;
        await this.telegramService.sendArticleToChannel(telegramText, telegramSlug);
      } catch (telegramError) {
        this.logger.error('Error posting to Telegram', telegramError);
      }

      // Publicar en Facebook
      try {
        const shareableLink = `${this.frontendUrl}/news/${article.slug}`;
        // Publicar en Facebook usando el enlace enriquecido
        await this.facebookService.postToFacebook(
          shareableLink
        );
    
        this.logger.log('News posted to Facebook successfully');
      } catch (error) {
        this.logger.error('Error posting to Facebook:', error.message);
      }

      // Publicar en Twitter 

      try {
        const tweetText = article.title;
        const tweetUrl = `https://alertatrabajo.com/articles/${article.slug}`;
        await this.twitterService.postTweet({ text: tweetText, url: tweetUrl });
      } catch (twitterError) {
        this.logger.error('Error posting tweet', twitterError);
      }

        return article;
      } catch (error) {
        if (error.code === 11000) {
          throw new BadRequestException(`Article exists in db ${JSON.stringify(error.keyValue)}`);
        }
        console.log(error);
        throw new InternalServerErrorException(`Can't create New - Check server logs`);
      }
    } catch (error) {
      throw new InternalServerErrorException(`Error during creation: ${error.message}`);
    }

  }
  // TODO: Implement method to publish social media { Twiiter, Telegram, Facebook }

  findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.articleModel.find()
      .limit(limit)
      .skip(offset)
      .select('-__v');
  }

  async findOne(term: string) {

    // Validación del término de búsqueda
    if (!term || typeof term !== 'string' || !term.trim()) {
      throw new BadRequestException('The search term must be a non-empty string.');
    }
    let article: Article;

    // Buscar por MongoId
    if (isValidObjectId(term)) {
      article = await this.articleModel.findById(term);
    }

    // Si no se encontró por MongoId, buscar por slug
    if (!article) {
      article = await this.articleModel.findOne({ slug: term.toLocaleLowerCase().trim() });
    }

    // Si no se encuentra ningún resultado, lanzar excepción
    if (!article) {
      throw new NotFoundException(`Article with id or slug "${term}" not found.`);
    }

    return article;
  }

  async update(term: string, updateArticleDto: UpdateArticleDto) {
    // Buscar el documento existente
    const article = await this.findOne(term);

    // Actualizar el slug si está presente
    if (updateArticleDto.slug) {
      updateArticleDto.slug = updateArticleDto.slug.toLowerCase().trim();
    }

    // Actualizar el documento en la base de datos
    const updatedArticle = await this.articleModel.findByIdAndUpdate(
      article._id, // ID del documento encontrado
      updateArticleDto, // Datos a actualizar
      { new: true } // Retornar el documento actualizado
    );

    // Si por alguna razón la actualización falla, lanzar un error
    if (!updatedArticle) {
      throw new Error('Failed to update the job news.');
    }

    return updatedArticle;
  }

  async remove(id: string) {
    const article = await this.findOne(id);
    await article.deleteOne()
  }

  // Generar slug
  generateSlug(title: string): string {
    return slugify(title, { lower: true, strict: true, trim: true });
  }

  // Increment Views

  async incrementViews(id: string): Promise<Article> {
    const updatedArticle = await this.articleModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).exec();

    if (!updatedArticle) {
      throw new NotFoundException(`New with ID "${id}" not found`);
    }

    return updatedArticle;
  }
}
