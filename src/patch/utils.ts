interface Hunk {
  oldStart: number;
  newStart: number;
  hunkLines: string[];
}

export const splitHunk = (diff: string) => {
  const lines = diff.split('\n');

  const hunks: Hunk[] = [];

  let curentHunk: Hunk = {
    oldStart: 0,
    newStart: 0,
    hunkLines: [] as string[],
  };

  lines.forEach((line) => {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/);
      if (curentHunk.hunkLines.length) {
        hunks.push(curentHunk);

        curentHunk = {
          oldStart: 0,
          newStart: 0,
          hunkLines: [] as string[],
        };
      }

      if (match) {
        curentHunk.oldStart = parseInt(match[1], 10);
        curentHunk.newStart = parseInt(match[3], 10);
      }
    }

    curentHunk.hunkLines.push(line);
  });

  if (curentHunk.hunkLines.length) {
    hunks.push(curentHunk);
  }

  return hunks;
};

export const comptuedHunkLineNumer = (hunk: Hunk) => {
  const { oldStart, newStart } = hunk;
  const temp: Array<[string, string]> = [];
  const newHunkLines: string[] = [hunk.hunkLines[0]];
  let maxHaedLength = 0;
  const oldLines: Map<number, string> = new Map();
  const newLines: Map<number, string> = new Map();

  // 使用独立的行号计数器，而不是基于 index 累加
  let oldLineNumber = oldStart;
  let newLineNumber = newStart;

  hunk.hunkLines.slice(1).forEach((line) => {
    let head = '';
    if (line.startsWith('-')) {
      // 删除行：只影响旧文件行号
      head = `(${oldLineNumber}, )`;
      temp.push([head, line]);
      oldLines.set(oldLineNumber, line);
      oldLineNumber++; // 只增加旧行号
      maxHaedLength = Math.max(maxHaedLength, head.length);
    } else if (line.startsWith('+')) {
      // 添加行：只影响新文件行号
      head = `( , ${newLineNumber})`;
      temp.push([head, line]);
      newLines.set(newLineNumber, line);
      newLineNumber++; // 只增加新行号
      maxHaedLength = Math.max(maxHaedLength, head.length);
    } else {
      // 上下文行：同时影响新旧文件行号
      head = `(${oldLineNumber}, ${newLineNumber})`;
      temp.push([head, line]);
      oldLines.set(oldLineNumber, line);
      newLines.set(newLineNumber, line);
      oldLineNumber++; // 同时增加新旧行号
      newLineNumber++;
      maxHaedLength = Math.max(maxHaedLength, head.length);
    }

    if (head.length > maxHaedLength) {
      maxHaedLength = head.length;
    }
  });

  temp.forEach(([head, line]) => {
    newHunkLines.push(`${head.padEnd(maxHaedLength)} ${line}`);
  });

  return [newHunkLines, newLines, oldLines] as const;
};
