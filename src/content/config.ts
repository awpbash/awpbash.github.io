import { z, defineCollection } from "astro:content";
import {
    STACK_TAGS,
    CONTEXT_TAGS,
    BLOG_KINDS,
} from "../lib/tags";

const stackEnum = z.enum(STACK_TAGS);
const contextEnum = z.enum(CONTEXT_TAGS);
const blogKindEnum = z.enum(BLOG_KINDS);

const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
    kind: blogKindEnum.optional(),
    relatedProject: z.string().optional(),
    featured: z.boolean().optional(),
});

const projectSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.string().optional(),
    heroImage: z.string().optional(),
    badge: z.string().optional(),
    // What you built. Filterable on /projects. At least one required.
    stack: z.array(stackEnum).min(1).refine(items => new Set(items).size === items.length, {
        message: 'stack tags must be unique',
    }),
    // Why it exists. Filterable on /projects. Single value.
    context: contextEnum,
    // Vendor / framework names worth surfacing on the detail page (max 3 by
    // convention). Plain text, not chips, no landing pages.
    tools: z.array(z.string()).max(3).refine(items => new Set(items).size === items.length, {
        message: 'tools must be unique',
    }).optional(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    // Slug of the companion blog post (the "story" side). Renders a CTA on the page.
    relatedPost: z.string().optional(),
    // Promotes to the home page.
    featured: z.boolean().optional(),
});

export type BlogSchema = z.infer<typeof blogSchema>;
export type ProjectSchema = z.infer<typeof projectSchema>;

const blogCollection = defineCollection({ schema: blogSchema });
const projectCollection = defineCollection({ schema: projectSchema });

export const collections = {
    'blog': blogCollection,
    'projects': projectCollection
}
