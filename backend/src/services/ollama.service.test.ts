// src/services/ollama.service.test.ts
import axios from 'axios';
import { OllamaService } from './ollama.service';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OllamaService', () => {
  let ollamaService: OllamaService;

  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.post.mockClear();
    ollamaService = new OllamaService();
  });

  it('should call the generate endpoint with the correct parameters', async () => {
    // Arrange
    const prompt = 'Why is the sky blue?';
    const model = 'codellama:7b';
    const expectedUrl = `${process.env.OLLAMA_API_URL || 'http://localhost:11434'}/api/generate`;
    const expectedPayload = {
      model: model,
      prompt: prompt,
      stream: false,
    };
    
    // Mock the post request to return a successful response
    mockedAxios.post.mockResolvedValue({ data: { response: 'It is blue because of Rayleigh scattering.' } });

    // Act
    await ollamaService.generate(prompt, model);

    // Assert
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(expectedUrl, expectedPayload, expect.any(Object));
  });
});
