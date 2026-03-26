import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d1a0d] flex">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
