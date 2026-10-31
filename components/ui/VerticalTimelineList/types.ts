export interface TimelineItem {
  id: string
  label: string
}

export interface VerticalTimelineListProps {
  items: Array<TimelineItem>
  color: string
}
