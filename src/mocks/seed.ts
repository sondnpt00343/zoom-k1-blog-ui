import type {
  Bookmark,
  Comment,
  Post,
  PostClap,
  PostRevision,
  Tag,
  Topic,
  TopicFollow,
  User,
  UserFollow,
  UserProfile,
} from '@/types/domain'

const now = new Date().toISOString()

export const DEMO_EMAIL = 'demo@inkwell.local'
export const DEMO_PASSWORD = 'demo123'

export const seedUsers: User[] = [
  {
    id: 'u-demo',
    email: DEMO_EMAIL,
    emailVerifiedAt: now,
    role: 'writer',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'u-linh',
    email: 'linh@example.com',
    emailVerifiedAt: now,
    role: 'writer',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'u-minh',
    email: 'minh@example.com',
    emailVerifiedAt: now,
    role: 'writer',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'u-an',
    email: 'an@example.com',
    emailVerifiedAt: now,
    role: 'reader',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
]

export const seedProfiles: UserProfile[] = [
  {
    userId: 'u-demo',
    displayName: 'Demo Writer',
    username: 'demowriter',
    bio: 'Biên tập viên thử nghiệm — viết về sản phẩm, văn hóa đọc và công cụ.',
    avatarUrl:
      'https://api.dicebear.com/9.x/avataaars/svg?seed=demowriter&backgroundColor=c0aede',
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: 'u-linh',
    displayName: 'Linh Trần',
    username: 'linhtran',
    bio: 'Kỹ sư frontend. Thích typography và hiệu năng.',
    avatarUrl:
      'https://api.dicebear.com/9.x/avataaars/svg?seed=linh&backgroundColor=b6e3f4',
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: 'u-minh',
    displayName: 'Minh Đỗ',
    username: 'minhdo',
    bio: 'Sản phẩm & dữ liệu. Đang học viết dài hơn 280 ký tự.',
    avatarUrl:
      'https://api.dicebear.com/9.x/avataaars/svg?seed=minh&backgroundColor=ffd5dc',
    createdAt: now,
    updatedAt: now,
  },
  {
    userId: 'u-an',
    displayName: 'An Nguyễn',
    username: 'annguyen',
    bio: 'Độc giả. Lưu bài để đọc lại cuối tuần.',
    avatarUrl:
      'https://api.dicebear.com/9.x/avataaars/svg?seed=an&backgroundColor=d1d4f9',
    createdAt: now,
    updatedAt: now,
  },
]

export const seedTags: Tag[] = [
  { id: 't1', name: 'Công nghệ', slug: 'cong-nghe' },
  { id: 't2', name: 'Sản phẩm', slug: 'san-pham' },
  { id: 't3', name: 'Văn hóa', slug: 'van-hoa' },
  { id: 't4', name: 'Phát triển bản thân', slug: 'phat-trien-ban-than' },
]

export const seedTopics: Topic[] = [
  {
    id: 'tp1',
    name: 'Thiết kế & UX',
    slug: 'thiet-ke-ux',
    description: 'Giao diện, trải nghiệm và những chi tiết nhỏ tạo nên sự khác biệt.',
  },
  {
    id: 'tp2',
    name: 'Kỹ thuật phần mềm',
    slug: 'ky-thuat-phan-mem',
    description: 'Kiến trúc, hiệu năng và công cụ cho đội ngũ phát triển.',
  },
]

export const seedPosts: Post[] = [
  {
    id: 'p1',
    authorId: 'u-demo',
    title: 'Tại sao chúng ta cần “không gian đọc” trên web',
    slug: 'khong-gian-doc-tren-web',
    subtitle: 'Giảm nhiễu, tăng nhịp thở cho chữ.',
    excerpt:
      'Một trang đọc tốt không chỉ là font đẹp — là nhịp dòng, độ rộng cột và sự im lặng giữa các đoạn.',
    body: `## Giới thiệu

Chúng ta đọc trên màn hình khác với giấy: ánh sáng ngược, cuộn vô tận, và vô số tab đang chờ.

### Ba nguyên tắc

1. **Độ rộng dòng** — khoảng 60–75 ký tự mỗi dòng giúp mắt không mỏi.
2. **Phân cấp** — tiêu đề phụ, trích dẫn và danh sách tạo “mỏ neo” cho mắt.
3. **Không gian âm** — khoảng trắng là phần thưởng, không phải lỗi thiết kế.

> “Typography là nhạc cho mắt.” — *một câu được nhắc lại đủ nhiều để trở thành sự thật.*

Kết luận: hãy thiết kế như bạn đang dựng một **phòng đọc nhỏ**, không phải bảng quảng cáo.`,
    coverImageUrl:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    readingTimeMinutes: 6,
    clapCount: 128,
    commentCount: 4,
    viewCount: 2400,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'p2',
    authorId: 'u-linh',
    title: 'Memo hóa component: khi nào đáng, khi nào thừa',
    slug: 'memo-hoa-component',
    subtitle: 'Đừng bọc mọi thứ bằng React.memo.',
    excerpt:
      'Memo là công cụ chẩn đoán hiệu năng, không phải mặc định cho mọi component.',
    body: `## Bắt đầu từ dữ liệu

\`React.memo\` hữu ích khi:

- Component **đắt** để render lại (danh sách lớn, biểu đồ).
- Props **ổn định** theo tham chiếu.

\`\`\`tsx
const Row = memo(function Row({ title }: { title: string }) {
  return <div>{title}</div>
})
\`\`\`

Nếu props luôn thay đổi (object mới mỗi lần render), memo **không cứu được** gì cả — hãy sửa tận gốc tạo object.

---

**Kết luận:** đo trước, memo sau.`,
    coverImageUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    readingTimeMinutes: 5,
    clapCount: 342,
    commentCount: 2,
    viewCount: 5100,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'p3',
    authorId: 'u-minh',
    title: 'Dữ liệu sản phẩm cho người mới: bắt đầu từ câu hỏi',
    slug: 'du-lieu-san-pham-cho-nguoi-moi',
    subtitle: 'Event, cohort, funnel — nhưng trước hết là “vì sao”.',
    excerpt:
      'Không cần hệ thống hoàn hảo ngày đầu; cần một vòng lặp đo và học.',
    body: `## Câu hỏi trước công cụ

1. Người dùng **đến từ đâu**?
2. Hành động **cốt lõi** là gì?
3. Bạn định nghĩa **thành công** ra sao?

Khi ba câu trả lời rõ, schema sự kiện và dashboard sẽ tự có chỗ đứng.

| Giai đoạn | Trọng tâm |
|-----------|-----------|
| Khởi đầu | Chuẩn hóa định nghĩa sự kiện |
| Tăng trưởng | Phân đoạn & cohort |
| Trưởng thành | Thử nghiệm & attribution |

Chúc bạn xây được **nhịp đo** đều đặn, không chỉ biểu đồ đẹp.`,
    coverImageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    readingTimeMinutes: 7,
    clapCount: 89,
    commentCount: 1,
    viewCount: 980,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'p-draft-1',
    authorId: 'u-demo',
    title: 'Bản nháp: Chuỗi bài về trải nghiệm đọc',
    slug: 'ban-nhap-trai-nghiem-doc',
    subtitle: null,
    excerpt: 'Đang viết dở — sẽ xuất bản sau khi chỉnh sửa.',
    body: '## TODO\n\n- Thêm ví dụ\n- Kiểm tra số liệu',
    coverImageUrl: null,
    status: 'draft',
    publishedAt: null,
    readingTimeMinutes: 2,
    clapCount: 0,
    commentCount: 0,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'p-archived-1',
    authorId: 'u-demo',
    title: 'Bài cũ đã lưu trữ',
    slug: 'bai-cu-da-luu-tru',
    subtitle: null,
    excerpt: 'Không còn hiển thị trên feed công khai.',
    body: 'Nội dung lưu trữ.',
    coverImageUrl: null,
    status: 'archived',
    publishedAt: new Date(Date.now() - 86400000 * 400).toISOString(),
    readingTimeMinutes: 1,
    clapCount: 12,
    commentCount: 0,
    viewCount: 300,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
]

export const seedPostTags: { postId: string; tagId: string }[] = [
  { postId: 'p1', tagId: 't3' },
  { postId: 'p1', tagId: 't2' },
  { postId: 'p2', tagId: 't1' },
  { postId: 'p2', tagId: 't2' },
  { postId: 'p3', tagId: 't2' },
  { postId: 'p3', tagId: 't4' },
]

export const seedPostTopics: { postId: string; topicId: string }[] = [
  { postId: 'p1', topicId: 'tp1' },
  { postId: 'p2', topicId: 'tp2' },
  { postId: 'p3', topicId: 'tp2' },
]

export const seedComments: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    userId: 'u-linh',
    parentId: null,
    body: 'Đồng ý phần độ rộng dòng — Medium làm điều này rất tốt.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'c2',
    postId: 'p1',
    userId: 'u-demo',
    parentId: 'c1',
    body: 'Cảm ơn Linh — mình sẽ bổ sung ví dụ cụ thể ở phần sau.',
    createdAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'c3',
    postId: 'p1',
    userId: 'u-minh',
    parentId: null,
    body: 'Phần trích dẫn render đẹp trên mobile.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'c4',
    postId: 'p2',
    userId: 'u-demo',
    parentId: null,
    body: 'Hay — có thể thêm ví dụ với useCallback?',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: now,
    deletedAt: null,
  },
]

export const seedPostClaps: PostClap[] = [
  { postId: 'p1', userId: 'u-linh', count: 12, updatedAt: now },
  { postId: 'p1', userId: 'u-minh', count: 30, updatedAt: now },
  { postId: 'p2', userId: 'u-demo', count: 24, updatedAt: now },
]

export const seedUserFollows: UserFollow[] = [
  { followerId: 'u-demo', followeeId: 'u-linh' },
  { followerId: 'u-an', followeeId: 'u-demo' },
]

export const seedTopicFollows: TopicFollow[] = [
  { userId: 'u-demo', topicId: 'tp1' },
]

export const seedBookmarks: Bookmark[] = [
  { userId: 'u-demo', postId: 'p2', createdAt: now },
  { userId: 'u-demo', postId: 'p3', createdAt: now },
]

export const seedRevisions: PostRevision[] = [
  {
    id: 'r1',
    postId: 'p-draft-1',
    snapshot: {
      title: 'Bản nháp cũ',
      body: '...',
      subtitle: null,
    },
    createdBy: 'u-demo',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]
