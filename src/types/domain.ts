export type UserRole = 'reader' | 'writer' | 'admin'

export type UserStatus = 'active' | 'suspended' | 'deleted'

export interface User {
  id: string
  email: string
  emailVerifiedAt: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface UserProfile {
  userId: string
  displayName: string
  username: string
  bio: string
  avatarUrl: string
  createdAt: string
  updatedAt: string
}

export type PostStatus = 'draft' | 'published' | 'archived'

export interface Post {
  id: string
  authorId: string
  title: string
  slug: string
  subtitle: string | null
  excerpt: string
  body: string
  coverImageUrl: string | null
  status: PostStatus
  publishedAt: string | null
  readingTimeMinutes: number
  clapCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Topic {
  id: string
  name: string
  slug: string
  description: string
}

export interface Comment {
  id: string
  postId: string
  userId: string
  parentId: string | null
  body: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface PostClap {
  postId: string
  userId: string
  count: number
  updatedAt: string
}

export interface UserFollow {
  followerId: string
  followeeId: string
}

export interface TopicFollow {
  userId: string
  topicId: string
}

export interface Bookmark {
  userId: string
  postId: string
  createdAt: string
}

export interface PostRevision {
  id: string
  postId: string
  snapshot: { title: string; body: string; subtitle: string | null }
  createdBy: string
  createdAt: string
}

export interface MediaAsset {
  id: string
  ownerId: string
  storageKey: string
  url: string
  mimeType: string
  byteSize: number
  createdAt: string
}
