import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getActiveCourse,
  getPalazzoTableMetrics,
  normalizeAngle,
  PALAZZO_STEP,
} from '../src/components/sites/sea-crown/palazzoTableMath.ts'

test('normalizes pointer deltas across the -180/180 boundary', () => {
  assert.equal(normalizeAngle(358), -2)
  assert.equal(normalizeAngle(-358), 2)
  assert.equal(normalizeAngle(45), 45)
})

test('maps each snapped table angle to the matching course', () => {
  for (let index = 0; index < 8; index += 1) {
    assert.equal(getActiveCourse(-index * PALAZZO_STEP), index)
  }
  assert.equal(getActiveCourse(-8 * PALAZZO_STEP), 0)
})

test('uses the Palazzo desktop geometry at 1440 by 900', () => {
  const metrics = getPalazzoTableMetrics(1440, 900)
  assert.equal(metrics.compact, false)
  assert.equal(metrics.stageSize, 1260)
  assert.equal(metrics.frontAngle, 180)
  assert.ok(Math.abs(metrics.centerX - 1282.95) < 0.01)
  assert.ok(Math.abs(metrics.centerY - 486) < 0.01)
})

test('moves the active plate above the table on a phone', () => {
  const metrics = getPalazzoTableMetrics(390, 844)
  assert.equal(metrics.compact, true)
  assert.equal(metrics.frontAngle, 270)
  assert.ok(Math.abs(metrics.stageSize - 764.4) < 0.01)
  assert.ok(Math.abs(metrics.centerX - 195) < 0.01)
})
