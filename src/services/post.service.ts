import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { CreateThemeDataDto } from '../dto/create-theme-data.dto';
import { existsSync } from 'fs';

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

  async generateTheme(themeData: CreateThemeDataDto) {
    try {
      const theme = themeData.themeName;
      const schoolName = themeData.name.toLowerCase().replace(/\s+/g, '-');
      const temporaryFolderName = `temp-${schoolName}-${Date.now()}`;
      
      // Create paths
      const themeFolderPath = path.resolve(__dirname, '../../themes', theme);
      const temporaryFolderPath = path.resolve(__dirname, '../../', temporaryFolderName);
      const buildFolderPath = path.resolve(temporaryFolderPath, 'finalBuild');
      const tempThemesPath = path.resolve(temporaryFolderPath, 'themes', theme);

      // Verify theme exists
      if (!existsSync(themeFolderPath)) {
        throw new NotFoundException(`Theme with name "${theme}" not found`);
      }
      
      // Create themes directory in temp folder
      await fs.mkdir(path.resolve(temporaryFolderPath, 'themes'), { recursive: true });
      
      // Copy theme files to temporary folder's themes directory
      await fs.cp(themeFolderPath, tempThemesPath, { recursive: true });
      
      // Create data directory and other setup...
      const dataDir = path.resolve(temporaryFolderPath, 'data');
      console.log('Creating data directory at:', dataDir);
      await fs.mkdir(dataDir, { recursive: true });

      // Write the data.json file
      const dataJsonPath = path.resolve(dataDir, 'data.json');
      console.log('Writing data file to:', dataJsonPath);
      await fs.writeFile(dataJsonPath, JSON.stringify(themeData, null, 2));

      // Verify file was written
      try {
        const fileContent = await fs.readFile(dataJsonPath, 'utf8');
        console.log('Verified data file content:', fileContent);
      } catch (err) {
        console.error('Error reading data file:', err);
      }

      console.log('Data file written to:', dataJsonPath);
      console.log('Data content:', JSON.stringify(themeData, null, 2));

      const configPath = path.resolve(temporaryFolderPath, 'config.toml');
      const configContent = `
baseURL = '/'
languageCode = 'en-us'
title = '${themeData.name}'
theme = '${theme}'

[params]
    description = "${themeData.description}"
    author = "${themeData.author}"
`;
      await fs.writeFile(configPath, configContent);

      // After creating data directory
      // Create content directories
      const contentDir = path.resolve(temporaryFolderPath, 'content');
      await fs.mkdir(contentDir, { recursive: true });

      // Create about page
      const aboutDir = path.resolve(contentDir, 'about');
      await fs.mkdir(aboutDir, { recursive: true });
      await fs.writeFile(
        path.resolve(aboutDir, '_index.md'),
        `---
title: "About"
---
About ${themeData.name}
`
      );

      // Create contact page
      const contactDir = path.resolve(contentDir, 'contact');
      await fs.mkdir(contactDir, { recursive: true });
      await fs.writeFile(
        path.resolve(contactDir, '_index.md'),
        `---
title: "Contact"
---
Contact information for ${themeData.name}
`
      );

      
      // Create build directory if it doesn't exist
      await fs.mkdir(buildFolderPath, { recursive: true });
      
      // Execute Hugo build command
      return new Promise((resolve, reject) => {
        const hugoCommand = `hugo -s ${temporaryFolderPath} -d ${buildFolderPath}`;
        console.log('Executing Hugo command:', hugoCommand);
        console.log('Working directory:', temporaryFolderPath);
        
        exec(hugoCommand, {
          cwd: temporaryFolderPath // Set working directory explicitly
        }, async (error, stdout, stderr) => {
          if (error) {
            console.error('Hugo build error:', error);
            console.error('Hugo build stderr:', stderr);
            console.error('Hugo build stdout:', stdout);
            // Clean up temporary folder
            await fs.rm(temporaryFolderPath, { recursive: true, force: true });
            reject(new Error(`Failed to generate static files: ${stderr || error.message}`));
            return;
          }
          
          console.log('Hugo build output:', stdout);
          if (stderr) console.error('Hugo build warnings:', stderr);
          
          resolve({
            message: 'Theme generated successfully',
            schoolName,
            temporaryFolder: temporaryFolderPath,
            buildFolder: buildFolderPath
          });
        });
      });
    } catch (error) {
      console.error('Error in generateTheme:', error);
      throw new Error(`Failed to generate theme: ${error.message}`);
    }
  }
}