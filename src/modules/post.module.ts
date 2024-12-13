import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from '../controllers/post.controller';
import { PostService } from '../services/post.service';
import { Post } from '../entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]), // Register Post entity with TypeORM
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService], // Export PostService if needed in other modules
})
export class PostModule {}