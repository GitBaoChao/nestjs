import yaml from 'js-yaml';
import { YamlContent, MRReview } from './types';

export function fixYamlFormatIssues(yamlContent: string): string {
  const lines = yamlContent.split('\n');
  const fixedLines: string[] = [];
  let inReviewItem = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 检测是否是新的 review 项
    if (line.trim().startsWith('- newPath:') || line.trim().startsWith('-newPath:')) {
      inReviewItem = true;
      // 确保正确的格式
      line = '  - newPath: |';
    }
    // 处理 review 项内的字段
    else if (inReviewItem) {
      const trimmedLine = line.trim();

      // 检查是否是字段名（包含冒号）
      if (trimmedLine.includes(':')) {
        // 提取字段名和值
        const colonIndex = trimmedLine.indexOf(':');
        const fieldName = trimmedLine.substring(0, colonIndex).trim();
        const fieldValue = trimmedLine.substring(colonIndex + 1).trim();

        // 处理常见的字段名
        const validFields = ['newPath', 'oldPath', 'startLine', 'endLine', 'type', 'issueHeader', 'issueContent'];

        if (validFields.includes(fieldName)) {
          // 对于多行字符串字段，使用 | 语法
          if (['newPath', 'oldPath', 'type', 'issueHeader', 'issueContent'].includes(fieldName)) {
            line = `    ${fieldName}: |`;
          } else {
            // 对于数字字段，直接赋值
            line = `    ${fieldName}: ${fieldValue}`;
          }
        } else {
          // 如果字段名不在预期列表中，可能是缩进问题导致的
          // 尝试修复缩进
          line = `    ${trimmedLine}`;
        }
      }
      // 处理字段值（非字段名的行）
      else if (trimmedLine.length > 0) {
        // 确保正确的缩进（字段值应该比字段名多2个空格）
        line = `      ${trimmedLine}`;
      }

      // 检查是否到了下一个 review 项
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith('- newPath:') || nextLine.startsWith('-newPath:')) {
          inReviewItem = false;
        }
      }
    }

    fixedLines.push(line);
  }

  return fixedLines.join('\n');
}

export function extractFirstYamlFromMarkdown(markdownText: string, isParse = true) {
  const regex = /```yaml\s*([\s\S]*?)\s*```/;
  const match = regex.exec(markdownText);

  if (!match) {
    return null;
  }

  const yamlContent: string = match[1];
  const result: YamlContent = {
    content: yamlContent,
    fixedContent: null,
    parsed: null,
    error: null,
    fixApplied: false,
  };

  if (isParse) {
    try {
      // 首先尝试直接解析
      const mrReview = yaml.load(yamlContent) as MRReview;
      if (mrReview && mrReview.reviews && Array.isArray(mrReview.reviews)) {
        mrReview.reviews.forEach((review) => {
          // 清理可能的换行符
          review.newPath = review.newPath?.replace(/\n/g, '') || '';
          review.oldPath = review.oldPath?.replace(/\n/g, '') || '';
          review.type = (review.type?.replace(/\n/g, '') as 'old' | 'new') || 'new';
        });
        result.parsed = mrReview;
      }
    } catch {
      // 如果直接解析失败，尝试修复格式后再解析
      console.log('直接解析失败，尝试修复格式...');
      try {
        const fixedYamlContent = fixYamlFormatIssues(yamlContent);
        result.fixedContent = fixedYamlContent;
        result.fixApplied = true;

        const mrReview = yaml.load(fixedYamlContent) as MRReview;
        if (mrReview && mrReview.reviews && Array.isArray(mrReview.reviews)) {
          mrReview.reviews.forEach((review) => {
            review.newPath = review.newPath?.replace(/\n/g, '') || '';
            review.oldPath = review.oldPath?.replace(/\n/g, '') || '';
            review.type = (review.type?.replace(/\n/g, '') as 'old' | 'new') || 'new';
          });
          result.parsed = mrReview;
        }
        console.log('格式修复成功，解析完成');
      } catch (fixError) {
        result.error = fixError instanceof Error ? fixError : new Error(String(fixError));
        console.log('格式修复后仍然解析失败:', result.error.message);
      }
    }
  }

  return result;
}
