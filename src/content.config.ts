import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const devlog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/devlog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    numero: z.string(),
    tag: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { devlog };
