// tools/github_indexer.ts
import path from 'path';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
import { OllamaService } from '../backend/src/services/ollama.service';
import { VectorService } from '../backend/src/services/vector.service';

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const GITHUB_COLLECTION_NAME = 'github_issues';
const REPO_OWNER = 'criticalhun'; // CSERÉLD LE A SAJÁT GITHUB FELHASZNÁLÓNEVEDRE
const REPO_NAME = 'ai-hyperloop';  // CSERÉLD LE A SAJÁT REPOZITÓRIUMOD NEVÉRE

async function runGitHubIndexer() {
  console.log('🚀 Starting GitHub issue indexing...');

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not set in the .env file.');
  }

  const octokit = new Octokit({ auth: githubToken });
  const ollamaService = new OllamaService();
  const vectorService = new VectorService(ollamaService);
  const collection = await vectorService.getOrCreateCollection(GITHUB_COLLECTION_NAME);

  const { data: issues } = await octokit.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open', // Csak a nyitott issue-kat kérjük le
  });

  console.log(`Found ${issues.length} open issues to index.`);

  for (const issue of issues) {
    try {
      // Az issue címét és törzsét indexeljük
      const contentToIndex = `Issue #${issue.number}: ${issue.title}\n\n${issue.body || ''}`;
      console.log(`- Indexing issue #${issue.number}: ${issue.title}`);
      
      const embedding = await ollamaService.createEmbedding(contentToIndex);
      
      const metadata = {
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
      };
      
      // Az issue száma string-ként lesz az ID
      await collection.add({ ids: [issue.number.toString()], embeddings: [embedding], metadatas: [metadata], documents: [contentToIndex] });

    } catch (error) {
      console.error(`  ❌ Failed to index issue #${issue.number}:`, error);
    }
  }
  console.log('\n✨ GitHub issue indexing complete.');
}

runGitHubIndexer().catch(console.error);
