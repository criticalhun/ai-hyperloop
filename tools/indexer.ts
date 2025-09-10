// tools/indexer.ts
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { OllamaService } from '../backend/src/services/ollama.service';
import { VectorService } from '../backend/src/services/vector.service';

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const INDEXING_MODEL = 'codellama:7b';
const ollamaService = new OllamaService();
const vectorService = new VectorService(ollamaService);
const CODEBASE_COLLECTION_NAME = 'codebase';

const IGNORE_PATTERNS = [
  'node_modules', '.git', 'dist', 'build', 'coverage', '.DS_Store',
  'package-lock.json', 'yarn.lock', '.env', '/app/build/', '/app/.dart_tool/',
  '/app/ios/', '/app/android/'
];
// ÚJ: Bináris fájlkiterjesztések listája
const BINARY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.so', '.dll', '.exe', '.dat', '.jar', '.class'];

async function getFilePaths(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (IGNORE_PATTERNS.some(pattern => res.includes(pattern))) return [];
      
      // ÚJ: Szűrés a bináris kiterjesztésekre
      if (!dirent.isDirectory() && BINARY_EXTENSIONS.includes(path.extname(res).toLowerCase())) {
        return [];
      }
      
      return dirent.isDirectory() ? getFilePaths(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

async function runIndexer() {
  console.log(`🚀 Starting codebase indexing with model: ${INDEXING_MODEL}`);
  const collection = await vectorService.getOrCreateCollection(CODEBASE_COLLECTION_NAME);
  const projectRoot = path.resolve(__dirname, '..');
  const filesToIndex = await getFilePaths(projectRoot);

  console.log(`Found ${filesToIndex.length} files to index.`);
  for (const filePath of filesToIndex) {
    try {
      console.log(`- Indexing file: ${path.relative(projectRoot, filePath)}`);
      const content = await fs.readFile(filePath, 'utf-8');
      if (!content.trim()) continue;

      const embedding = await ollamaService.createEmbedding(content);
      const fileId = path.relative(projectRoot, filePath);
      await vectorService.addDocument(collection, fileId, content, embedding);
      console.log(`  ✅ Successfully indexed.`);
    } catch (error) {
        // Most már csak a tényleges hibákat logoljuk, a bináris fájlok csendben kimaradnak
        if (error instanceof Error && error.message.includes('malformed')) {
            console.log(`  - Skipping file with non-UTF8 content: ${path.relative(projectRoot, filePath)}`);
        } else {
            console.error(`  ❌ Failed to index file ${filePath}:`, error);
        }
    }
  }
  console.log('\n✨ Codebase indexing complete.');
}

runIndexer().catch(console.error);
