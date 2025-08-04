export interface Config {
  gitlabToken: string;
  baseUrl: string;
}

export interface MrRequestBody {
  user: User;
  object_attributes: ObjectAttributes;
  project: Project;
}

export interface User {
  username: string;
}

export interface ObjectAttributes {
  title: string;
  source_branch: string;
  target_branch: string;
  iid: number;
  url: string;
}

export interface Project {
  name: string;
  id: number;
  web_url: string;
}
