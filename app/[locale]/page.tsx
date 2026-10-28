import { MetroCanvas } from '@/components/canvas/MetroCanvas/MetroCanvas'
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle'
import { ToolsMenu } from '@/components/ui/ToolsMenu/ToolsMenu'

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <MetroCanvas />
      <ToolsMenu />
      <ThemeToggle />
    </div>
  )
}
