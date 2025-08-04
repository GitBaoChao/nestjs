export interface GitlabChangesRes {
  changes: Change[];
  diff_refs: DiffRefs;
}

export interface Change {
  old_path: string;
  new_path: string;
  a_mode: string;
  b_mode: string;
  diff: string;
  new_file: boolean;
  deleted_file: boolean;
  newFileContent: string;
  oldFileContent: string;
  extendedDiff: string;
  newLinesWithNumber: Map<number, string>;
  oldLinesWithNumber: Map<number, string>;
}

export interface DiffRefs {
  base_sha: string;
  head_sha: string;
  start_sha: string;
}
