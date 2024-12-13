import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    HttpStatus, 
    HttpCode ,
    HttpException
  } from '@nestjs/common';
  import { PostService } from '../services/post.service';
  import { CreatePostDto } from '../dto/create-post.dto';
  import { UpdatePostDto } from '../dto/update-post.dto';
  import { Post as PostEntity } from '../entities/post.entity';
  import { CreateThemeDataDto } from '../dto/create-theme-data.dto';
  
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
  
    @Post('generate-theme')
    @HttpCode(HttpStatus.CREATED)
    async generateTheme(@Body() themeData: CreateThemeDataDto) {
      try{
        const result = await this.postService.generateTheme(themeData);
        return {
          statusCode: HttpStatus.CREATED,
          message: ' Theme generated successfully',
          data: result
        };
      } catch (error) {
        console.error('Error in generateTheme controller: ', error);
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message ||'Failed to generate theme',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
       
    }
  }