export type Category = 'Visual art' | 'Photography' | 'Music' | 'Film' | 'Creative technology' | 'Research';

export type Project = {
  slug: string;
  title: string;
  category: Category;
  year: string;
  description: string;
  medium: string;
  featured?: boolean;
  index: string;
  accent: string;
  body: string[];
  links?: { label: string; url: string }[];
};

// Replace these sample entries with real work. Keep each slug unique.
export const projects: Project[] = [
  {
    slug: 'tourism', title: 'Tourism', category: 'Music', year: '2026',
    description: 'An independent music project exploring texture, atmosphere and the edges of familiar sounds.',
    medium: 'Composition · Production · Recording · Mixing', featured: true, index: '001', accent: 'plum',
    body: ['A study in sound and atmosphere, built from original performances, layered recordings and detailed production.', 'This entry is a placeholder for the story behind the work. Add the intent, process, tools and the decisions that shaped the final piece.'],
    links: [{ label: 'Listen to the project', url: 'https://example.com' }]
  },
  {
    slug: 'field-notes', title: 'Field Notes', category: 'Photography', year: '2026',
    description: 'A developing collection of observations, fragments and found compositions.',
    medium: 'Photography · Digital post-production', featured: true, index: '002', accent: 'ochre',
    body: ['A photographic archive of places, details and passing moments.', 'Replace this text with the location context, creative direction and editing approach.']
  },
  {
    slug: 'archive76', title: 'Archive76', category: 'Creative technology', year: '2026',
    description: 'A local-first desktop application for organising and tracking Fallout 76 collections.',
    medium: 'TypeScript · React · Tauri · Rust · SQLite', featured: true, index: '003', accent: 'blue',
    body: ['A desktop application built around structured data, fast search and a locally stored collection database.', 'Document the architecture, interface decisions, implementation details and what you learned building it.'],
    links: [{ label: 'Source code', url: 'https://github.com/' }]
  },
  {
    slug: 'moving-image-study', title: 'Moving Image Study', category: 'Film', year: '2025',
    description: 'A visual experiment in movement, rhythm and the relationship between image and sound.',
    medium: 'Videography · Editing · Sound design', index: '004', accent: 'green',
    body: ['A place for short films, visual studies, edits and experiments.', 'Add a film embed or stills, explain your role and describe the production process.']
  },
  {
    slug: 'generative-systems', title: 'Generative Systems', category: 'Research', year: '2025',
    description: 'Notes and experiments at the intersection of computation, AI and creative practice.',
    medium: 'AI · Programming · Technical research', index: '005', accent: 'pink',
    body: ['An evolving notebook of technical experiments and research.', 'Record the question, setup, methodology, observations and conclusions.']
  },
  {
    slug: 'image-fragments', title: 'Image Fragments', category: 'Visual art', year: '2025',
    description: 'Digital compositions assembled from drawing, photography and image manipulation.',
    medium: 'Digital art · Drawing · Image-making', index: '006', accent: 'silver',
    body: ['A collection for illustrations, digital compositions, drawings and visual experiments.', 'Add the ideas, source materials and techniques behind each piece.']
  }
];

export const categories = ['All', 'Visual art', 'Photography', 'Music', 'Film', 'Creative technology', 'Research'] as const;
