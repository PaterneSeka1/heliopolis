export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col">
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
