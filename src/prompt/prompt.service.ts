import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PromptService {
  private cachePrompt: string;

  constructor() {
    this.cachePrompt = fs.readFileSync(path.resolve(process.cwd(), 'public', 'prompt.txt'), 'utf-8');
  }

  getMessages(query: string) {
    return [
      {
        role: 'system',
        content: this.cachePrompt,
      },
      {
        role: 'user',
        content: query,
      },
    ];
  }
}
