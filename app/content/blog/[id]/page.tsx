import BlogCreateClient from "@/components/content/BlogCreateClient"

type ManualPostDraft = {
  category: string
  content: string
  seoDescription: string
  seoTitle: string
  tags: string
  thumbnail: string
  title: string
}

const manualPostDrafts: Record<string, ManualPostDraft> = {
  "ai-video-workflows": {
    category: "AI Content",
    content: `
      <h2>How AI video workflows reduce editing time</h2>
      <p>Manual editing often slows down campaign publishing. AI-assisted workflows help content teams reduce repetitive work while keeping creative control.</p>
      <h3>Workflow impact</h3>
      <ul>
        <li>Faster draft generation</li>
        <li>Reusable shortform templates</li>
        <li>Lower review overhead</li>
      </ul>
      <blockquote>Teams can focus on direction and quality instead of repetitive clipping.</blockquote>
    `,
    seoDescription: "Learn how AI video workflows reduce editing time for content teams.",
    seoTitle: "How AI Video Workflows Reduce Editing Time",
    tags: "AI, workflow, editing",
    thumbnail: "https://cdn.yettey.com/blog/ai-video-workflows.jpg",
    title: "How AI Video Workflows Reduce Editing Time",
  },
  "thumbnail-patterns": {
    category: "Video Editing",
    content: `
      <h2>Thumbnail patterns that improve click-through</h2>
      <p>High-performing thumbnails usually combine clear subjects, readable text, and strong visual contrast.</p>
      <h3>Patterns to test</h3>
      <ol>
        <li>Face-forward thumbnail</li>
        <li>Before and after layout</li>
        <li>Single benefit headline</li>
      </ol>
      <p>Use the editor toolbar to add examples, screenshots, and campaign notes.</p>
    `,
    seoDescription: "Thumbnail design patterns that improve click-through for shortform videos.",
    seoTitle: "Thumbnail Patterns That Improve Click-Through",
    tags: "thumbnail, video, conversion",
    thumbnail: "https://cdn.yettey.com/blog/thumbnail-patterns.jpg",
    title: "Thumbnail Patterns That Improve Click-Through",
  },
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <BlogCreateClient
      initialDraft={manualPostDrafts[id] ?? { title: "Untitled Manual Post" }}
      mode="edit"
      postId={id}
    />
  )
}
