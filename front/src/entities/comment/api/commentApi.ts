import type { Comment, UserPreview } from "../model/types";
import { __postModalMockDb } from "../../post/api/postApi";

type CommentRecord = {
  id: string;
  postId: string;
  author: UserPreview;
  text: string;
  createdAt: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toComment = (record: CommentRecord): Comment => {
  const meId = __postModalMockDb.getMeId();
  return {
    id: record.id,
    postId: record.postId,
    author: record.author,
    text: record.text,
    createdAt: record.createdAt,
    isMine: record.author.id === meId,
  };
};

const makeId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
};

export const commentApi = {
  getByPostId: async (postId: string, params?: { limit?: number; offset?: number }) => {
    await sleep(250);

    const limit = Math.max(0, params?.limit ?? 3);
    const offset = Math.max(0, params?.offset ?? 0);

    const records = __postModalMockDb
      .getCommentRecordsByPostId(postId)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return records.slice(offset, offset + limit).map(toComment);
  },

  create: async (postId: string, text: string): Promise<Comment> => {
    await sleep(250);

    const nextText = text.trim();
    if (!nextText) throw new Error("Comment text is required");

    const meId = __postModalMockDb.getMeId();
    const record: CommentRecord = {
      id: makeId(),
      postId,
      author: { id: meId, username: "me", avatarUrl: null },
      text: nextText,
      createdAt: new Date().toISOString(),
    };

    __postModalMockDb.addCommentRecord(record);
    return toComment(record);
  },

  update: async (commentId: string, text: string): Promise<Comment> => {
    await sleep(250);
    const updated = __postModalMockDb.updateCommentText(commentId, text);
    return toComment(updated as CommentRecord);
  },

  delete: async (commentId: string): Promise<void> => {
    await sleep(250);
    __postModalMockDb.deleteCommentRecord(commentId);
  },
};
