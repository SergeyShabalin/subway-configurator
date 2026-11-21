import { MetroCanvas } from '@/components/canvas/MetroCanvas/MetroCanvas'
import { MetroSidebar } from '@/components/canvas/MetroSidebar/MetroSidebar'
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle'

export default function Home() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <MetroCanvas />
      <ThemeToggle />
      <MetroSidebar />
    </div>
  )
}
