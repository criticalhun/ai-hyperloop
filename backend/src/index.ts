import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { OllamaService } from './services/ollama.service';
import { VectorService } from './services/vector.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Instantiate services
const ollamaService = new OllamaService();
const vectorService = new VectorService(ollamaService); // Pass ollamaService to VectorService

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/ask', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    console.log(`Received query: ${query}`);

    // 1. Retrieve context from the vector database
    const codebaseCollection = await vectorService.getOrCreateCollection('codebase');
    const contextDocuments = await vectorService.query(codebaseCollection, query, 3);
    console.log(`Retrieved ${contextDocuments.length} context documents.`);

    // 2. Augment the prompt with the retrieved context
    const augmentedPrompt = `
      Based on the following code context from the project, answer the user's question.
      If the context is not relevant, use your general knowledge.

      --- CONTEXT ---
      ${contextDocuments.join('\n\n---\n\n')}
      --- END CONTEXT ---

      User's Question: ${query}
    `;

    // 3. Generate a response using the augmented prompt
    const response = await ollamaService.generate(augmentedPrompt);

    console.log(`Ollama response generated.`);
    res.status(200).json({ response, context: contextDocuments });
  } catch (error)
  {
    console.error('Error in /api/ask:', error);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
