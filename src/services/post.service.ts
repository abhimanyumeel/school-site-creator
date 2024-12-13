import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    // const post = this.postRepository.create(createPostDto);
    // await this.postRepository.save(post);
    const theme = "default";
    const temporaryFolderName = "temp-" + Date.now();
    // copy the files of the theme folder to the temporary folder
    console.log("copying theme files to temporary folder", __dirname);
    console.log(path.resolve(__dirname, '../../themes', theme));
    console.log(path.resolve(__dirname, '../../', temporaryFolderName));
    const themeFolderPath = path.resolve(__dirname, '../../themes', theme);
    const temporaryFolderPath = path.resolve(__dirname, '../../', temporaryFolderName);
    await fs.cp(themeFolderPath, temporaryFolderPath, { recursive: true });
    
    // now overwrite the posts.json in the temporary folder with the new post
    const postsPath = path.resolve(__dirname, '../../', temporaryFolderName, 'data', 'posts.json');
    await fs.writeFile(postsPath, JSON.stringify({posts: [createPostDto]}, null, 2));

    const buildFolderPath = path.resolve(__dirname, '../../', temporaryFolderName, 'finalBuild');

    // execute the hugo command to generate the static files
    const hugoCommand = `hugo build -s ${temporaryFolderPath} -d ${buildFolderPath}`;
    exec(hugoCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing hugo: ${error.message}`);
        throw new Error('Failed to generate static files');
      }
      console.log(stdout);
      console.error(stderr);
    });
    // return post;
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
      order: {
        date: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    await this.postRepository.save(post);
    return post;
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  private generateMarkdownContent(post: Post): string {
    const frontMatter = `---
title: "${post.title}"
date: ${post.date.toISOString()}
draft: ${post.draft}
---

<!-- Content is managed through posts.json -->
`;
    return frontMatter.trim() + '\n';
}
}