import { db } from '@/lib/db'

// Создаем таблицы если их нет
db.exec(`
  CREATE TABLE IF NOT EXISTS lines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_circular INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    line_id TEXT NOT NULL,
    FOREIGN KEY (line_id) REFERENCES lines(id)
  );

  CREATE TABLE IF NOT EXISTS visuals (
    id TEXT PRIMARY KEY,
    x REAL NOT NULL,
    y REAL NOT NULL,
    label_x INTEGER DEFAULT 0,
    label_y INTEGER DEFAULT -20,
    is_transfer INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS visual_station_links (
    visual_id TEXT,
    station_id TEXT,
    PRIMARY KEY (visual_id, station_id),
    FOREIGN KEY (visual_id) REFERENCES visuals(id),
    FOREIGN KEY (station_id) REFERENCES stations(id)
  );

  CREATE TABLE IF NOT EXISTS segments (
    id TEXT PRIMARY KEY,
    from_station_id TEXT NOT NULL,
    to_station_id TEXT NOT NULL,
    time_minutes INTEGER NOT NULL,
    FOREIGN KEY (from_station_id) REFERENCES stations(id),
    FOREIGN KEY (to_station_id) REFERENCES stations(id)
  );
`)

// Добавляем тестовую ветку, чтобы было с чего начать
const testLineId = 'line-1'
const existingLine = db.prepare('SELECT * FROM lines WHERE id = ?').get(testLineId)

if (!existingLine) {
  db.prepare(
    `
    INSERT INTO lines (id, name, color, is_circular)
    VALUES (?, ?, ?, ?)
  `
  ).run(testLineId, 'Красная ветка', '#ef4444', 0)
  console.log('✅ Created test line: Красная ветка')
}

console.log('✅ Database initialized successfully!')
console.log('  Lines:', db.prepare('SELECT COUNT(*) as count FROM lines').get())
console.log('  Stations:', db.prepare('SELECT COUNT(*) as count FROM stations').get())
console.log('  Visuals:', db.prepare('SELECT COUNT(*) as count FROM visuals').get())
