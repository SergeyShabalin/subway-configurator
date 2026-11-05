export interface TimelineItem {
  id: string
  label: string
}

export type TimelineLineVariant = 'single' | 'double'

export interface VerticalTimelineListProps {
  items: Array<TimelineItem>
  color: string
  variant?: TimelineLineVariant
}
