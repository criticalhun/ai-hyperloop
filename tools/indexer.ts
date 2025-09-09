// tools/indexer.ts
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { OllamaService } from '../backend/src/services/ollama.service';
import { VectorService } from '../backend/src/services/vector.service';

// Load environment variables from the backend's .env file
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const ollamaService = new OllamaService();
const vectorService = new VectorService();

const CODEBASE_COLLECTION_NAME = 'codebase';

// Directories and files to ignore during indexing
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  '.env'
];

async function getFilePaths(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (IGNORE_PATTERNS.some(pattern => res.includes(pattern))) {
        return [];
      }
      return dirent.isDirectory() ? getFilePaths(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

async function runIndexer() {
  console.log('🚀 Starting codebase indexing...');

  const collection = await vectorService.getOrCreateCollection(CODEBASE_COLLECTION_NAME);
  const projectRoot = path.resolve(__dirname, '..');
  
  const filesToIndex = await getFilePaths(projectRoot);

  console.log(`Found ${filesToIndex.length} files to index.`);

  for (const filePath of filesToIndex) {
    try {
      console.log(`- Indexing file: ${path.relative(projectRoot, filePath)}`);
      const content = await fs.readFile(filePath, 'utf-8');

      if (!content.trim()) {
        console.log(`  - Skipping empty file.`);
        continue;
      }

      const embedding = await ollamaService.createEmbedding(content);
      
      // Use a consistent ID based on the file path
      const fileId = path.relative(projectRoot, filePath);

      await vectorService.addDocument(collection, fileId, content, embedding);
      console.log(`  ✅ Successfully indexed.`);
    } catch (error) {
      console.error(`  ❌ Failed to index file ${filePath}:`, error);
    }
  }

  console.log('\n✨ Codebase indexing complete.');
}

runIndexer().catch(console.error);
