export type Blog = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogViewModel =
  | Blog
  | {
      id: string;
    };
