// src/services/ollama.service.ts
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

// A felesleges 'GenerateResponse' interfész eltávolítva innen.

export class OllamaService {
  async generate(prompt: string, model: string = 'codellama:7b'): Promise<string> {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: model,
        prompt: prompt,
        stream: false, // For simplicity, we disable streaming for now
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.data.response;
  }

  async createEmbedding(text: string, model: string = 'codellama:7b'): Promise<number[]> {
    const response = await axios.post(
        `${OLLAMA_URL}/api/embeddings`,
        {
            model: model,
            prompt: text,
        },
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );

    return response.data.embedding;
  }
}
