// backend/src/services/ollama.service.ts
import axios from 'axios';
const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const DEFAULT_MODEL = 'codellama:7b';

export class OllamaService {
  async generate(prompt: string): Promise<string> {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`,
      { model: DEFAULT_MODEL, prompt, stream: false },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data.response;
  }
  async createEmbedding(text: string): Promise<number[]> {
    const response = await axios.post(`${OLLAMA_URL}/api/embeddings`,
      { model: DEFAULT_MODEL, prompt: text },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data.embedding;
  }
}
