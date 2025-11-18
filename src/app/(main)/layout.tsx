import { BottomNav } from '@/components/navigation/BottomNav';
import { PageTransition } from '@/components/ui/page-transition';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-gradient-start))] to-[hsl(var(--bg-gradient-end))] pb-20">
      <PageTransition>
        {children}
      </PageTransition>
      <BottomNav />
    </div>
  );
}
