import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OllamaService } from './services/ollama.service';
import { VectorService } from './services/vector.service';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const ollamaService = new OllamaService();
const vectorService = new VectorService(ollamaService);

app.post('/api/ask', async (req: Request, res: Response) => {
  const { query } = req.body; // Már csak a 'query'-t várjuk
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  try {
    const codebaseCollection = await vectorService.getOrCreateCollection('codebase');
    const contextDocuments = await vectorService.query(codebaseCollection, query);
    const augmentedPrompt = `
      Context: ${contextDocuments.join('\n\n---\n\n')}
      Question: ${query}
    `;
    const response = await ollamaService.generate(augmentedPrompt);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process the request.' });
  }
});

app.listen(3000, () => console.log(`Server listening on port 3000`));
