import { YamlContent } from "./types";
export declare function fixYamlFormatIssues(yamlContent: string): string;
export declare function extractFirstYamlFromMarkdown(markdownText: string, isParse?: boolean): YamlContent | null;
