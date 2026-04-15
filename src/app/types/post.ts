export type Lean = 'left' | 'right' | 'center';

export interface Post {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  image: string;
  topic: string;
  lean: Lean;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string[];
  soundLabel?: string;
}

export interface UserInteraction {
  postId: string;
  type: 'like' | 'comment' | 'share';
  topic: string;
  lean: Lean;
}
