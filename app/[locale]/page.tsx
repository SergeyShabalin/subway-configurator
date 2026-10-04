import { MetroCanvas } from '@/components/canvas/MetroCanvas'
import { ToolsMenu } from '@/components/ui/ToolsMenu/ToolsMenu'

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <MetroCanvas />
      <ToolsMenu />
    </div>
  )
}
