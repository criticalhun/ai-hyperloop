// src/services/experimentation.service.ts
import { exec } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class ExperimentationService {
  async analyzeFlutterCode(code: string): Promise<string> {
    const projectPath = join(__dirname, '../../../app');
    const tempDirPath = join(projectPath, 'temp_experiments');
    const tempFileName = `temp_widget_${Date.now()}.dart`;
    const tempFilePath = join(tempDirPath, tempFileName);

    try {
      // JAVÍTVA: Robusztusabb tisztítás, ami a 'dart' szót is kezeli
      const cleanedCode = code.replace(/^```dart\s*|```\s*$/g, '').trim();

      // Most már nem adunk hozzá plusz importot, rábízzuk az AI-ra
      await mkdir(tempDirPath, { recursive: true });
      await writeFile(tempFilePath, cleanedCode, 'utf-8');

      console.log(`Analyzing temporary file inside project: ${tempFilePath}`);
      
      const { stdout } = await execPromise(`flutter analyze ${tempFilePath}`, { cwd: projectPath });
      
      return stdout;
    } finally {
      await unlink(tempFilePath).catch(err => console.error(`Failed to delete temp file: ${err.message}`));
    }
  }
}
