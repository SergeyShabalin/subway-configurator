import type Konva from 'konva'

let currentStage: Konva.Stage | null = null

export const setStage = (stage: Konva.Stage | null) => {
  currentStage = stage
}

export const getStage = () => currentStage
