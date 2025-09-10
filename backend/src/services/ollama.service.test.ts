// src/services/ollama.service.test.ts
import axios from 'axios';
import { OllamaService } from './ollama.service';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OllamaService', () => {
  let ollamaService: OllamaService;
  const DEFAULT_MODEL = 'codellama:7b'; // A service-ben definiált modell

  beforeEach(() => {
    mockedAxios.post.mockClear();
    ollamaService = new OllamaService();
  });

  it('should call the generate endpoint with the correct parameters', async () => {
    // Arrange
    const prompt = 'Why is the sky blue?';
    const expectedUrl = `${process.env.OLLAMA_API_URL || 'http://localhost:11434'}/api/generate`;
    // A payload már a fix modellt tartalmazza
    const expectedPayload = {
      model: DEFAULT_MODEL,
      prompt: prompt,
      stream: false,
    };
    
    mockedAxios.post.mockResolvedValue({ data: { response: 'It is blue...' } });

    // Act
    // A hívás most már helyesen, 1 argumentummal történik
    await ollamaService.generate(prompt);

    // Assert
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, expectedPayload, expect.any(Object));
  });
  
  // Kiegészíthetjük az createEmbedding tesztjével is
  it('should call the embeddings endpoint with the correct parameters', async () => {
    // Arrange
    const text = 'hello world';
    const expectedUrl = `${process.env.OLLAMA_API_URL || 'http://localhost:11434'}/api/embeddings`;
    const expectedPayload = {
      model: DEFAULT_MODEL,
      prompt: text,
    };

    mockedAxios.post.mockResolvedValue({ data: { embedding: [0.1, 0.2, 0.3] } });

    // Act
    await ollamaService.createEmbedding(text);

    // Assert
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, expectedPayload, expect.any(Object));
  });
});
