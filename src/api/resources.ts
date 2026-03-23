import type {
  Comment,
  Post,
  PostRevision,
  Tag,
  Topic,
  UserProfile,
} from '@/types/domain'

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostFormData,
  apiPut,
} from './http'

export type PostFeedBundle = {
  posts: Post[]
  profilesByUserId: Record<string, UserProfile>
}

export type ProfileWithStats = UserProfile & {
  followerCount: number
  viewerFollows: boolean
}

export type TopicWithFollow = Topic & { viewerFollows: boolean }

export type PublishedFeedFilters = {
  topicSlug?: string
  tagSlug?: string
  authorUsername?: string
}

export async function fetchPublishedPosts(filters?: PublishedFeedFilters) {
  const q = new URLSearchParams({ include: 'author' })
  if (filters?.topicSlug) q.set('topicSlug', filters.topicSlug)
  if (filters?.tagSlug) q.set('tagSlug', filters.tagSlug)
  if (filters?.authorUsername) q.set('authorUsername', filters.authorUsername)
  return apiGet<PostFeedBundle>(`/posts/published?${q}`)
}

export async function fetchSearchPosts(query: string) {
  const q = query.trim()
  if (!q) {
    return { posts: [] as Post[], profilesByUserId: {} as Record<string, UserProfile> }
  }
  return apiGet<PostFeedBundle>(
    `/posts/search?q=${encodeURIComponent(q)}&include=author`,
  )
}

export async function fetchPostBySlug(username: string, slug: string) {
  return apiGet<Post>(
    `/posts/by-slug/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
  )
}

export async function fetchComments(postId: string) {
  return apiGet<Comment[]>(`/posts/${postId}/comments`)
}

export async function fetchProfile(username: string) {
  return apiGet<ProfileWithStats>(
    `/profiles/${encodeURIComponent(username)}`,
  )
}

export async function fetchProfileByUserId(userId: string) {
  return apiGet<UserProfile & { followerCount: number }>(
    `/profiles/user/${userId}`,
  )
}

export async function fetchTags() {
  return apiGet<Tag[]>(`/tags`)
}

export async function fetchTopics() {
  return apiGet<Topic[]>(`/topics`)
}

export async function fetchTopicBySlug(slug: string) {
  return apiGet<TopicWithFollow>(
    `/topics/by-slug/${encodeURIComponent(slug)}`,
  )
}

export async function fetchPostsByTopicSlug(slug: string) {
  return apiGet<PostFeedBundle>(
    `/topics/by-slug/${encodeURIComponent(slug)}/posts?include=author`,
  )
}

export async function fetchTagBySlug(slug: string) {
  const tags = await fetchTags()
  return tags.find((t) => t.slug === slug) ?? null
}

export async function fetchPostsByTagSlug(tagSlug: string) {
  return apiGet<PostFeedBundle>(
    `/tags/by-slug/${encodeURIComponent(tagSlug)}/posts?include=author`,
  )
}

export async function fetchMyPosts() {
  return apiGet<Post[]>(`/me/posts`)
}

export async function fetchMyBookmarks() {
  return apiGet<Post[]>(`/me/bookmarks`)
}

export type CreateDraftInput = {
  title: string
  body: string
  excerpt?: string
  subtitle?: string | null
  slug?: string
  coverImageUrl?: string | null
}

export async function createDraftPost(input: CreateDraftInput) {
  const payload: Record<string, unknown> = {
    title: input.title,
    body: input.body,
  }
  if (input.excerpt !== undefined) payload.excerpt = input.excerpt
  if (input.subtitle !== undefined) payload.subtitle = input.subtitle
  if (input.slug) payload.slug = input.slug
  if (input.coverImageUrl) payload.coverImageUrl = input.coverImageUrl
  return apiPost<Post>(`/posts`, payload)
}

export async function uploadImage(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return apiPostFormData<{ url: string }>(`/uploads`, fd)
}

export async function updatePost(
  postId: string,
  patch: Partial<{
    title: string
    subtitle: string | null
    excerpt: string
    body: string
    slug: string
    coverImageUrl: string | null
    status: string
  }>,
) {
  return apiPatch<Post>(`/posts/${postId}`, patch)
}

export async function publishPost(postId: string) {
  return apiPost<Post>(`/posts/${postId}/publish`, {})
}

export async function unpublishPost(postId: string) {
  return apiPost<Post>(`/posts/${postId}/unpublish`, {})
}

export async function deletePost(postId: string) {
  await apiDelete(`/posts/${postId}`)
}

export async function putPostTags(postId: string, tagIds: string[]) {
  await apiPut(`/posts/${postId}/tags`, { tagIds })
}

export async function putPostTopics(postId: string, topicIds: string[]) {
  await apiPut(`/posts/${postId}/topics`, { topicIds })
}

export async function fetchPostTags(postId: string) {
  return apiGet<Tag[]>(`/posts/${postId}/tags`)
}

export async function fetchPostTopics(postId: string) {
  return apiGet<Topic[]>(`/posts/${postId}/topics`)
}

export async function addRevision(postId: string, snapshot: PostRevision['snapshot']) {
  return apiPost<PostRevision>(`/posts/${postId}/revisions`, { snapshot })
}

export async function fetchRevisions(postId: string) {
  return apiGet<PostRevision[]>(`/posts/${postId}/revisions`)
}

export async function createTag(name: string, slug?: string) {
  return apiPost<Tag>(`/tags`, { name, slug })
}

export async function createTopic(
  name: string,
  description: string,
  slug?: string,
) {
  return apiPost<Topic>(`/topics`, { name, description, slug })
}

export async function postComment(
  postId: string,
  body: string,
  parentId: string | null,
) {
  return apiPost<Comment>(`/posts/${postId}/comments`, { body, parentId })
}

export async function deleteComment(commentId: string) {
  await apiDelete(`/comments/${commentId}`)
}

export async function updateComment(commentId: string, body: string) {
  return apiPatch<Comment>(`/comments/${commentId}`, { body })
}

export async function putClap(postId: string, count: number) {
  return apiPut<{
    postId: string
    userId: string
    count: number
    updatedAt: string
  }>(`/posts/${postId}/claps`, { count })
}

export async function fetchMyClap(postId: string) {
  return apiGet<{
    postId: string
    userId: string
    count: number
    updatedAt: string
  } | null>(`/posts/${postId}/claps/me`)
}

export async function toggleBookmark(postId: string, bookmarked: boolean) {
  if (bookmarked) {
    await apiPost(`/posts/${postId}/bookmark`, {})
  } else {
    await apiDelete(`/posts/${postId}/bookmark`)
  }
}

export async function followUser(userId: string, follow: boolean) {
  if (follow) {
    await apiPost(`/users/${userId}/follow`, {})
  } else {
    await apiDelete(`/users/${userId}/follow`)
  }
}

export async function followTopic(topicId: string, follow: boolean) {
  if (follow) {
    await apiPost(`/topics/${topicId}/follow`, {})
  } else {
    await apiDelete(`/topics/${topicId}/follow`)
  }
}

export async function updateMeProfile(
  patch: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl' | 'username'>>,
) {
  return apiPatch<UserProfile>(`/me/profile`, patch)
}

export async function postReadEvent(
  postId: string,
  sessionId: string,
  readRatio?: number,
) {
  await apiPost(`/posts/${postId}/read-events`, { sessionId, readRatio })
}
