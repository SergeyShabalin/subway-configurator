import db from '../lib/db'
import metroData from './metro.json'

// Очищаем таблицы
db.exec(`
  DELETE FROM segments;
  DELETE FROM visual_station_links;
  DELETE FROM visuals;
  DELETE FROM stations;
  DELETE FROM lines;
`)

const lines = Object.values(metroData.lines)
for (const line of lines) {
  db.prepare(
    `
    INSERT OR REPLACE INTO lines (id, name, color, is_circular)
    VALUES (?, ?, ?, ?)
  `
  ).run(line.id, line.name, line.color, line.isCircular ? 1 : 0)
}

const logicStations = Object.values(metroData.logic.stations)
for (const station of logicStations) {
  let lineId = 0
  for (const line of lines) {
    if (line.logicalStationIds.includes(station.id)) {
      lineId = line.id
      break
    }
  }

  db.prepare(
    `
    INSERT OR REPLACE INTO stations (id, name, line_id)
    VALUES (?, ?, ?)
  `
  ).run(station.id, station.name, lineId)
}

const visuals = Object.values(metroData.visuals.stations)
for (const visual of visuals) {
  const isTransfer = visual.connections.length > 1

  db.prepare(
    `
    INSERT OR REPLACE INTO visuals (id, x, y, label_x, label_y, is_transfer)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(
    visual.id,
    visual.x,
    visual.y,
    visual.labelOffset?.x || 0,
    visual.labelOffset?.y || -60,
    isTransfer ? 1 : 0
  )

  for (const stationId of visual.connections) {
    db.prepare(
      `
      INSERT OR REPLACE INTO visual_station_links (visual_id, station_id)
      VALUES (?, ?)
    `
    ).run(visual.id, stationId)
  }
}

const segments = Object.values(metroData.logic.segments)
for (const segment of segments) {
  db.prepare(
    `
    INSERT OR REPLACE INTO segments (id, from_station_id, to_station_id, time_minutes)
    VALUES (?, ?, ?, ?)
  `
  ).run(segment.id, segment.fromStationId, segment.toStationId, segment.timeMinutes)
}

console.log('✅ Migrated successfully!')
console.log(
  `Lines: ${lines.length}, Stations: ${logicStations.length}, Visuals: ${visuals.length}, Segments: ${segments.length}`
)
