export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col px-8 py-16">
        
        {/* Header */}
        <div className="mb-16 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Yettey Admin</h1>
            <p className="mt-2 text-zinc-400">
              AI Media Workflow Platform Dashboard
            </p>
          </div>

          <button className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200">
            Login
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Total Users</p>
            <h2 className="mt-4 text-4xl font-bold">12,580</h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Active Subscriptions</p>
            <h2 className="mt-4 text-4xl font-bold">2,184</h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Generated Videos</p>
            <h2 className="mt-4 text-4xl font-bold">48,201</h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Monthly Revenue</p>
            <h2 className="mt-4 text-4xl font-bold">$82,430</h2>
          </div>

        </div>

        {/* Quick Menu */}
        <div className="mt-16">
          <h3 className="mb-6 text-2xl font-semibold">
            Quick Access
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <button className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-zinc-600">
              <h4 className="text-lg font-semibold">Users</h4>
              <p className="mt-2 text-sm text-zinc-400">
                Manage platform users
              </p>
            </button>

            <button className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-zinc-600">
              <h4 className="text-lg font-semibold">Analytics</h4>
              <p className="mt-2 text-sm text-zinc-400">
                View platform statistics
              </p>
            </button>

            <button className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-zinc-600">
              <h4 className="text-lg font-semibold">Billing</h4>
              <p className="mt-2 text-sm text-zinc-400">
                Subscription & payment management
              </p>
            </button>

            <button className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:border-zinc-600">
              <h4 className="text-lg font-semibold">Settings</h4>
              <p className="mt-2 text-sm text-zinc-400">
                Configure system settings
              </p>
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}