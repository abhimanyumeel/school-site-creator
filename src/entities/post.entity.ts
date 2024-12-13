import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Interfaces for nested structures
interface Intro {
  heading: string;
  text: string;
}

interface Subsection {
  title: string;
  points: string[];
}

interface Section {
  heading: string;
  subsections: Subsection[];
}

interface Table {
  title: string;
  headers: string[];
  rows: string[][];
}

interface Tables {
  [key: string]: Table;  // For dynamic table names like 'academicMetrics', 'timeManagement'
}

interface Quote {
  text: string;
  author: string;
}

interface Conclusion {
  text: string;
}

interface Content {
  intro: Intro;
  sections?: Section[];
  tables?: Tables;
  quote?: Quote;
  conclusion?: Conclusion;
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'timestamp with time zone' })  // Changed to handle timezone
  date: Date;

  @Column({ default: false })
  draft: boolean;

  @Column()
  title: string;

  @Column('jsonb')
  content: Content;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
