import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#050505] text-white font-sans">
            <Sidebar />
            <main className="flex-1 overflow-auto h-screen bg-[#050505] border-l border-white/[0.02]">
                {children}
            </main>
        </div>
    );
}
