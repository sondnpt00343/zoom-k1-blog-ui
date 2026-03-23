import { useMemo } from 'react'
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import * as api from '@/api/resources'
import type { PublishedFeedFilters } from '@/api/resources'
import { useAuthStore } from '@/store/useAuthStore'
import type { PostRevision, UserProfile } from '@/types/domain'

export const qk = {
  published: (filters?: {
    topicSlug?: string
    tagSlug?: string
    authorUsername?: string
  }) =>
    [
      'posts',
      'published',
      filters?.topicSlug ?? '',
      filters?.tagSlug ?? '',
      filters?.authorUsername ?? '',
    ] as const,
  search: (q: string) => ['posts', 'search', q] as const,
  postSlug: (u: string, s: string) => ['posts', 'slug', u, s] as const,
  comments: (postId: string) => ['posts', postId, 'comments'] as const,
  profile: (username: string) => ['profiles', username] as const,
  tags: () => ['tags'] as const,
  topics: () => ['topics'] as const,
  topicBySlug: (slug: string) => ['topics', 'slug', slug] as const,
  topicPosts: (slug: string) => ['topics', slug, 'posts'] as const,
  tagPosts: (slug: string) => ['tags', slug, 'posts'] as const,
  myPosts: () => ['me', 'posts'] as const,
  bookmarks: () => ['me', 'bookmarks'] as const,
  postTags: (postId: string) => ['posts', postId, 'tags'] as const,
  postTopics: (postId: string) => ['posts', postId, 'topics'] as const,
  revisions: (postId: string) => ['posts', postId, 'revisions'] as const,
  myClap: (postId: string) => ['posts', postId, 'claps', 'me'] as const,
}

export function usePublishedPosts(filters?: PublishedFeedFilters) {
  return useQuery({
    queryKey: qk.published(filters),
    queryFn: () => api.fetchPublishedPosts(filters),
  })
}

export function useSearchPosts(query: string) {
  return useQuery({
    queryKey: qk.search(query),
    queryFn: () => api.fetchSearchPosts(query),
    enabled: query.trim().length > 0,
  })
}

export function usePostBySlug(username: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: username && slug ? qk.postSlug(username, slug) : ['posts', 'slug', 'none'],
    queryFn: () => api.fetchPostBySlug(username!, slug!),
    enabled: Boolean(username && slug),
  })
}

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: postId ? qk.comments(postId) : ['comments', 'none'],
    queryFn: () => api.fetchComments(postId!),
    enabled: Boolean(postId),
  })
}

export function useProfile(username: string | undefined) {
  return useQuery({
    queryKey: username ? qk.profile(username) : ['profile', 'none'],
    queryFn: () => api.fetchProfile(username!),
    enabled: Boolean(username),
  })
}

export function useTags() {
  return useQuery({ queryKey: qk.tags(), queryFn: () => api.fetchTags() })
}

export function useTopics() {
  return useQuery({ queryKey: qk.topics(), queryFn: () => api.fetchTopics() })
}

export function useTopicBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? qk.topicBySlug(slug) : ['topic', 'none'],
    queryFn: () => api.fetchTopicBySlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useTopicPosts(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? qk.topicPosts(slug) : ['topicPosts', 'none'],
    queryFn: () => api.fetchPostsByTopicSlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useTagPosts(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? qk.tagPosts(slug) : ['tagPosts', 'none'],
    queryFn: () => api.fetchPostsByTagSlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useMyPosts() {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: qk.myPosts(),
    queryFn: () => api.fetchMyPosts(),
    enabled: Boolean(uid),
  })
}

export function useMyBookmarks() {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: qk.bookmarks(),
    queryFn: () => api.fetchMyBookmarks(),
    enabled: Boolean(uid),
  })
}

export function usePostTags(postId: string | undefined) {
  return useQuery({
    queryKey: postId ? qk.postTags(postId) : ['postTags', 'none'],
    queryFn: () => api.fetchPostTags(postId!),
    enabled: Boolean(postId),
  })
}

export function usePostTopics(postId: string | undefined) {
  return useQuery({
    queryKey: postId ? qk.postTopics(postId) : ['postTopics', 'none'],
    queryFn: () => api.fetchPostTopics(postId!),
    enabled: Boolean(postId),
  })
}

export function useRevisions(postId: string | undefined) {
  return useQuery({
    queryKey: postId ? qk.revisions(postId) : ['revisions', 'none'],
    queryFn: () => api.fetchRevisions(postId!),
    enabled: Boolean(postId),
  })
}

export function useMyClap(postId: string | undefined) {
  const uid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: postId ? qk.myClap(postId) : ['clap', 'none'],
    queryFn: () => api.fetchMyClap(postId!),
    enabled: Boolean(postId && uid),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.updateMeProfile,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export function useCreateDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: api.CreateDraftInput) => api.createDraftPost(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.myPosts() })
    },
  })
}

export function useUpdatePost(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Parameters<typeof api.updatePost>[1]) =>
      api.updatePost(postId, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.myPosts() })
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function usePublishPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.publishPost,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['posts'] })
      void qc.invalidateQueries({ queryKey: qk.myPosts() })
      void qc.invalidateQueries({ queryKey: ['posts', 'published'] })
    },
  })
}

export function useUnpublishPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.unpublishPost,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['posts'] })
      void qc.invalidateQueries({ queryKey: qk.myPosts() })
      void qc.invalidateQueries({ queryKey: ['posts', 'published'] })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => api.deletePost(postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['posts'] })
      void qc.invalidateQueries({ queryKey: qk.myPosts() })
      void qc.invalidateQueries({ queryKey: qk.bookmarks() })
      void qc.invalidateQueries({ queryKey: ['posts', 'published'] })
    },
  })
}

export function usePutPostTags(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tagIds: string[]) => api.putPostTags(postId, tagIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.postTags(postId) })
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function usePutPostTopics(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (topicIds: string[]) => api.putPostTopics(postId, topicIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.postTopics(postId) })
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useAddRevision(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (snapshot: PostRevision['snapshot']) =>
      api.addRevision(postId, snapshot),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.revisions(postId) })
    },
  })
}

export function usePostComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      body,
      parentId,
    }: {
      body: string
      parentId: string | null
    }) => api.postComment(postId, body, parentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.comments(postId) })
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.comments(postId) })
    },
  })
}

export function useClapMutation(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (count: number) => api.putClap(postId, count),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.myClap(postId) })
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useBookmarkMutation(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bookmarked: boolean) => api.toggleBookmark(postId, bookmarked),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.bookmarks() })
      void qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useFollowUserMutation(username: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, follow }: { userId: string; follow: boolean }) =>
      api.followUser(userId, follow),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.profile(username) })
    },
  })
}

export function useFollowTopicMutation(topicSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ topicId, follow }: { topicId: string; follow: boolean }) =>
      api.followTopic(topicId, follow),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.topicBySlug(topicSlug) })
    },
  })
}

export function useReadEvent(postId: string) {
  return useMutation({
    mutationFn: ({
      sessionId,
      readRatio,
    }: {
      sessionId: string
      readRatio?: number
    }) => api.postReadEvent(postId, sessionId, readRatio),
  })
}

/** Resolves author profiles for a list of posts (e.g. bookmarks). */
export function useProfilesByUserIds(userIds: string[]) {
  const unique = useMemo(() => [...new Set(userIds)], [userIds])
  const results = useQueries({
    queries: unique.map((id) => ({
      queryKey: ['profiles', 'user', id] as const,
      queryFn: () => api.fetchProfileByUserId(id),
      enabled: unique.length > 0,
    })),
  })
  return useMemo(() => {
    const m: Record<string, UserProfile> = {}
    unique.forEach((id, i) => {
      const row = results[i]?.data
      if (row) m[id] = row
    })
    return m
  }, [unique, results])
}
