// src/services/vector.service.ts
import { ChromaClient, Collection } from 'chromadb';
import { OllamaService } from './ollama.service'; // Import OllamaService

const CHROMA_URL = process.env.CHROMA_DB_URL || 'http://localhost:8000';

export class VectorService {
  private client: ChromaClient;
  private ollamaService: OllamaService; // Add ollamaService property

  constructor(ollamaService: OllamaService) { // Accept OllamaService in constructor
    this.client = new ChromaClient({ path: CHROMA_URL });
    this.ollamaService = ollamaService;
  }

  async getOrCreateCollection(name: string): Promise<Collection> {
    return await this.client.getOrCreateCollection({ name });
  }

  async addDocument(collection: Collection, id: string, document: string, embedding: number[]) {
    await collection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [document],
    });
  }

  // New method for querying the collection
  async query(collection: Collection, queryText: string, nResults: number = 3): Promise<string[]> {
    const queryEmbedding = await this.ollamaService.createEmbedding(queryText);
    
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: nResults,
    });

    // Return the document contents, filtering out any nulls
    return results.documents[0].filter((doc): doc is string => doc !== null);
  }
}	
