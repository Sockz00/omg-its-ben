import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'src/content/projects');
const disciplines = new Set(['music', 'sound', 'photography', 'digital-art', 'drawing', 'design', 'code', 'ai', 'security', 'creative-coding', 'research']);
const statuses = new Set(['complete', 'ongoing', 'archived', 'concept']);
const files = fs.readdirSync(contentDir).filter((file) => file.endsWith('.json')).sort();
const errors = [];
const projects = [];
const localPathExists = (src) => src.startsWith('/') ? fs.existsSync(path.join(root, 'public', src.slice(1))) : true;

const checkImage = (image, label) => {
  if (!image || typeof image !== 'object' || Array.isArray(image)) return errors.push(`${label}: expected an image object`);
  if (typeof image.src !== 'string' || !image.src) errors.push(`${label}: missing src`);
  if (typeof image.alt !== 'string' || !image.alt.trim()) errors.push(`${label}: missing alt`);
  if (!Number.isFinite(image.width) || image.width <= 0 || !Number.isFinite(image.height) || image.height <= 0) errors.push(`${label}: invalid dimensions`);
  if (typeof image.src === 'string' && !localPathExists(image.src)) errors.push(`${label}: local image does not exist: ${image.src}`);
};

const checkCover = (cover, label) => {
  if (cover && typeof cover === 'object' && 'src' in cover) checkImage(cover, label);
  else if (!cover || !['contour', 'grid', 'orbit', 'noise', 'bars'].includes(cover.generative) || !Number.isFinite(cover.seed)) errors.push(`${label}: malformed cover`);
};

for (const file of files) {
  const filenameSlug = file.slice(0, -5);
  let project;
  try { project = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8')); }
  catch (error) { errors.push(`${file}: invalid JSON (${error.message})`); continue; }
  projects.push(project);
  for (const field of ['slug', 'title', 'description', 'body', 'category', 'created', 'published', 'status']) {
    if (typeof project[field] !== 'string' || !project[field]) errors.push(`${file}: missing required ${field}`);
  }
  if (project.slug !== filenameSlug) errors.push(`${file}: filename does not match slug`);
  if (!disciplines.has(project.category)) errors.push(`${file}: invalid category`);
  if (project.disciplines && (!Array.isArray(project.disciplines) || project.disciplines.some((value) => !disciplines.has(value)))) errors.push(`${file}: invalid disciplines`);
  if (!statuses.has(project.status)) errors.push(`${file}: invalid status`);
  for (const field of ['created', 'published']) if (typeof project[field] === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(project[field]) || (typeof project[field] === 'string' && Number.isNaN(Date.parse(project[field])))) errors.push(`${file}: invalid ${field} date`);
  if (!Array.isArray(project.tags)) errors.push(`${file}: tags must be an array`);
  checkCover(project.cover, `${file}: cover`);
  if (project.gallery) project.gallery.forEach((image, index) => checkImage(image, `${file}: gallery[${index}]`));
  if (project.audio?.artwork) checkCover(project.audio.artwork, `${file}: audio.artwork`);
}

const slugs = new Set(projects.map((project) => project.slug));
if (slugs.size !== projects.length) errors.push('duplicate project slug');
for (const project of projects) for (const related of project.related ?? []) if (!slugs.has(related)) errors.push(`${project.slug}: related project does not exist: ${related}`);

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const drafts = projects.filter((project) => project.draft).length;
console.log(`Validated ${projects.length} project files (${drafts} draft${drafts === 1 ? '' : 's'} excluded by the loader).`);
