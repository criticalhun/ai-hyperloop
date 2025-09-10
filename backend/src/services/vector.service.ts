// backend/src/services/vector.service.ts
import { ChromaClient, Collection } from 'chromadb';
import { OllamaService } from './ollama.service';

export class VectorService {
  private client: ChromaClient;
  private ollamaService: OllamaService;
  constructor(ollamaService: OllamaService) {
    this.client = new ChromaClient({ path: process.env.CHROMA_DB_URL || 'http://localhost:8000' });
    this.ollamaService = ollamaService;
  }
  async getOrCreateCollection(name: string): Promise<Collection> {
    return await this.client.getOrCreateCollection({ name });
  }
  async query(collection: Collection, queryText: string, nResults: number = 3): Promise<string[]> {
    const queryEmbedding = await this.ollamaService.createEmbedding(queryText);
    const results = await collection.query({ queryEmbeddings: [queryEmbedding], nResults });
    return results.documents[0].filter((doc): doc is string => doc !== null);
  }
  // Az addDocument metódus hiányzott a VectorService-ből, pótoljuk
  async addDocument(collection: Collection, id: string, document: string, embedding: number[]) {
    await collection.add({ ids: [id], embeddings: [embedding], documents: [document] });
  }
}
