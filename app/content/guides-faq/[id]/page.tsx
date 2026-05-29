import BlogCreateClient from "@/components/content/BlogCreateClient"

type GuideDraft = {
  category: string
  content: string
  seoDescription: string
  seoTitle: string
  tags: string
  thumbnail: string
  title: string
}

const guideCategoryOptions = [
  "Getting Started",
  "Asset Management",
  "AI Creation",
  "Video Automation",
  "Team Collaboration",
  "Billing",
]

const guideDrafts: Record<string, GuideDraft> = {
  "getting-started-guide": {
    category: "Getting Started",
    content: `
      <h2>Getting started with Yettey</h2>
      <p>This guide helps new teams set up their workspace, invite members, and create their first media workflow.</p>
      <h3>Recommended setup flow</h3>
      <ol>
        <li>Create a workspace</li>
        <li>Upload starter assets</li>
        <li>Invite collaborators</li>
        <li>Create the first project</li>
      </ol>
    `,
    seoDescription: "Learn how to set up Yettey and create your first project.",
    seoTitle: "Getting Started with Yettey",
    tags: "getting-started, onboarding, workspace",
    thumbnail: "https://cdn.yettey.com/guides/getting-started.jpg",
    title: "Getting Started with Yettey",
  },
  "credit-usage-guide": {
    category: "Billing",
    content: `
      <h2>Credit usage and billing guide</h2>
      <p>Credits are consumed when AI generation, video automation, and selected processing jobs complete successfully.</p>
      <blockquote>Use billing settings to monitor monthly subscription credits and purchased credits separately.</blockquote>
    `,
    seoDescription: "Understand how credits are used across Yettey and VPICK workflows.",
    seoTitle: "Credit Usage and Billing Guide",
    tags: "credits, billing, subscription",
    thumbnail: "https://cdn.yettey.com/guides/credit-usage.jpg",
    title: "Credit Usage and Billing Guide",
  },
}

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <BlogCreateClient
      backHref="/content/guides-faq"
      categoryOptions={guideCategoryOptions}
      contentType="guide"
      initialDraft={guideDrafts[id] ?? { title: "Untitled Guide" }}
      mode="edit"
      postId={id}
    />
  )
}
