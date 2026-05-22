import Header from "./Header"
import Sidebar from "./Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto flex max-w-[1536px]">
        <Sidebar />

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-8 xl:px-9">
          {children}
        </main>
      </div>
    </div>
  )
}
