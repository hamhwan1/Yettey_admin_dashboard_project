import BlogCreateClient from "@/components/content/BlogCreateClient"

const guideCategoryOptions = [
  "Getting Started",
  "Asset Management",
  "AI Creation",
  "Video Automation",
  "Team Collaboration",
  "Billing",
]

export default function CreateGuidePage() {
  return (
    <BlogCreateClient
      backHref="/content/guides-faq"
      categoryOptions={guideCategoryOptions}
      contentType="guide"
    />
  )
}
