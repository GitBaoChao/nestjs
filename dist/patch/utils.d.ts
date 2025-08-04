interface Hunk {
    oldStart: number;
    newStart: number;
    hunkLines: string[];
}
export declare const splitHunk: (diff: string) => Hunk[];
export declare const comptuedHunkLineNumer: (hunk: Hunk) => readonly [string[], Map<number, string>, Map<number, string>];
export {};
