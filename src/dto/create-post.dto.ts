import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IntroDto {
  @IsNotEmpty()
  @IsString()
  heading: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}

class SubsectionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString({ each: true })
  points: string[];
}

class SectionDto {
  @IsNotEmpty()
  @IsString()
  heading: string;

  @ValidateNested({ each: true })
  @Type(() => SubsectionDto)
  subsections: SubsectionDto[];
}

class TableDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString({ each: true })
  headers: string[];

  @IsNotEmpty()
  @IsString({ each: true })
  rows: string[][];
}

class QuoteDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  author: string;
}

class ConclusionDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

class ContentDto {
  @ValidateNested()
  @Type(() => IntroDto)
  intro: IntroDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];

  @IsOptional()
  @ValidateNested()
  tables?: { [key: string]: TableDto };

  @IsOptional()
  @ValidateNested()
  @Type(() => QuoteDto)
  quote?: QuoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConclusionDto)
  conclusion?: ConclusionDto;
}

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsBoolean()
  draft: boolean;

  @IsNotEmpty()
  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => ContentDto)
  content: ContentDto;
}