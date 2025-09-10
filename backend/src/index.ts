// src/index.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OllamaService } from './services/ollama.service';
import { VectorService } from './services/vector.service';
import { ExperimentationService } from './services/experimentation.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ollamaService = new OllamaService();
const vectorService = new VectorService(ollamaService);
const experimentationService = new ExperimentationService();

// Meglévő RAG végpont
app.post('/api/ask', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  try {
    console.log(`Received query: "${query}"`);

    const codebaseCollection = await vectorService.getOrCreateCollection('codebase');
    const gitCollection = await vectorService.getOrCreateCollection('git_commits');
    const issuesCollection = await vectorService.getOrCreateCollection('github_issues');

    const [codeContext, gitContext, issueContext] = await Promise.all([
      vectorService.query(codebaseCollection, query, 2),
      vectorService.query(gitCollection, query, 2),
      vectorService.query(issuesCollection, query, 2),
    ]);

    console.log(`Retrieved context: ${codeContext.length} code, ${gitContext.length} commits, ${issueContext.length} issues.`);

    const augmentedPrompt = `
      You are a software engineer assistant. Answer based on the following context.
      --- RELEVANT CODE SNIPPETS ---
      ${codeContext.join('\n---\n') || 'N/A'}
      --- RELEVANT GIT COMMITS ---
      ${gitContext.join('\n---\n') || 'N/A'}
      --- RELEVANT OPEN ISSUES ---
      ${issueContext.join('\n---\n') || 'N/A'}
      --- END CONTEXT ---
      User's Question: ${query}
    `;
    const response = await ollamaService.generate(augmentedPrompt);
    res.status(200).json({ response });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
});

// Végpont a kódgeneráláshoz és teszteléshez
app.post('/api/generate-and-test', async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    let generatedCode = '';
    try {
        console.log(`Received code generation prompt: "${prompt}"`);

        const generationPrompt = `
            You are an expert Flutter/Dart developer.
            Generate a single, complete, standalone, and syntactically correct Dart code file based on the user's request.
            Your response MUST follow these rules:
            1.  Start DIRECTLY with the code. Do NOT include any introduction, explanation, or markdown fences like \`\`\`dart.
            2.  Include all necessary imports (e.g., 'package:flutter/material.dart').
            3.  Ensure all public widgets have a 'Key? key' in their constructor (e.g., 'const MyWidget({super.key});').
            
            User's request: "${prompt}"
        `;

        generatedCode = await ollamaService.generate(generationPrompt);
        
        console.log('Generated code received, starting analysis...');
        const analysisResult = await experimentationService.analyzeFlutterCode(generatedCode);
        console.log('Analysis complete.');

        res.status(200).json({ generatedCode, analysisResult });

    } catch (error: any) {
        console.error('Error in /api/generate-and-test:', error.message);
        res.status(200).json({
            generatedCode: generatedCode,
            analysisResult: error.stdout || error.message,
        });
    }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
