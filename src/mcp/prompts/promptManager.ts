import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as Handlebars from 'handlebars';

interface PromptConfig {
  summarize: string;
  [key: string]: string;
}

export class PromptManager {
  private prompts: PromptConfig;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private customPromptPath: string | undefined;

  constructor(customPromptPath?: string) {
    this.customPromptPath = customPromptPath;
    this.prompts = this.loadPrompts();
    this.compileTemplates();
  }

  private loadPrompts(): PromptConfig {
    // First, load default prompts
    const defaultPath = path.resolve(__dirname, '../../config/prompts.yml');
    let prompts = this.loadYamlFile(defaultPath);

    // If custom prompt path is provided, merge with defaults
    if (this.customPromptPath && fs.existsSync(this.customPromptPath)) {
      const customPrompts = this.loadYamlFile(this.customPromptPath);
      prompts = { ...prompts, ...customPrompts };
    }

    return prompts;
  }

  private loadYamlFile(filePath: string): PromptConfig {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return yaml.load(fileContents) as PromptConfig;
    } catch (error) {
      throw new Error(`Failed to load prompts from ${filePath}: ${error}`);
    }
  }

  private compileTemplates(): void {
    for (const [key, template] of Object.entries(this.prompts)) {
      this.compiledTemplates.set(key, Handlebars.compile(template));
    }
  }

  public getTemplate(name: string): HandlebarsTemplateDelegate {
    const template = this.compiledTemplates.get(name);
    if (!template) {
      throw new Error(`Template '${name}' not found`);
    }
    return template;
  }

  public render(templateName: string, context: any): string {
    const template = this.getTemplate(templateName);
    return template(context);
  }

  public reloadPrompts(): void {
    this.prompts = this.loadPrompts();
    this.compiledTemplates.clear();
    this.compileTemplates();
  }

  public setCustomPromptPath(path: string): void {
    this.customPromptPath = path;
    this.reloadPrompts();
  }
}

// Export a singleton instance
export const promptManager = new PromptManager();
