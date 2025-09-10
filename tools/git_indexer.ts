// tools/git_indexer.ts
import path from 'path';
import dotenv from 'dotenv';
import { simpleGit } from 'simple-git';
import { OllamaService } from '../backend/src/services/ollama.service';
import { VectorService } from '../backend/src/services/vector.service';

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const GIT_COLLECTION_NAME = 'git_commits';
const INDEXING_MODEL = 'codellama:7b';

async function runGitIndexer() {
  console.log('🚀 Starting Git commit history indexing...');

  const ollamaService = new OllamaService();
  const vectorService = new VectorService(ollamaService);
  const collection = await vectorService.getOrCreateCollection(GIT_COLLECTION_NAME);

  const projectRoot = path.resolve(__dirname, '..');
  const git = simpleGit(projectRoot);

  const log = await git.log();
  const commits = log.all;

  console.log(`Found ${commits.length} commits to index.`);

  for (const commit of commits) {
    try {
      // Csak az üzenetet indexeljük, a többi adat metaadat lesz
      const contentToIndex = commit.message;
      if (!contentToIndex.trim()) continue;

      console.log(`- Indexing commit ${commit.hash.substring(0, 7)}: ${commit.message.split('\n')[0]}`);
      
      const embedding = await ollamaService.createEmbedding(contentToIndex);
      
      // A ChromaDB nem támogatja a ':' karaktert a metaadat kulcsokban
      const metadata = {
        hash: commit.hash,
        author: commit.author_name,
        date: commit.date,
      };

      // A commit hash-e lesz az egyedi azonosító
      await collection.add({ ids: [commit.hash], embeddings: [embedding], metadatas: [metadata], documents: [contentToIndex] });
      
    } catch (error) {
      console.error(`  ❌ Failed to index commit ${commit.hash}:`, error);
    }
  }

  console.log('\n✨ Git commit indexing complete.');
}

runGitIndexer().catch(console.error);
