import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    HttpStatus, 
    HttpCode 
  } from '@nestjs/common';
  import { PostService } from '../services/post.service';
  import { CreatePostDto } from '../dto/create-post.dto';
  import { UpdatePostDto } from '../dto/update-post.dto';
  import { Post as PostEntity } from '../entities/post.entity';
  
  @Controller('posts')
  export class PostController {
    constructor(private readonly postService: PostService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createPostDto: CreatePostDto) {
      return this.postService.create(createPostDto);
    }
  
    @Get()
    findAll(): Promise<PostEntity[]> {
      return this.postService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string): Promise<PostEntity> {
      return this.postService.findOne(id);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: string, 
      @Body() updatePostDto: UpdatePostDto
    ): Promise<PostEntity> {
      return this.postService.update(id, updatePostDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string): Promise<void> {
      return this.postService.remove(id);
    }
  }