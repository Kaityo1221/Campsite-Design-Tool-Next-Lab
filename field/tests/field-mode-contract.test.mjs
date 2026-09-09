import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  validateFieldModePayload,
  siteSummary,
  categorySummary,
  reviewTargetsGeoJSON,
} from '../field-mode-contract.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(here, '../fixtures/field-mode-sample-v0.1.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

test('accepts the read-only v0.1 Headquarters contract', () => {
  const result = validateFieldModePayload(fixture);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('rejects payloads that enable automatic execution or category fanout', () => {
  const unsafe = structuredClone(fixture);
  unsafe.automatic_execution = true;
  unsafe.automatic_category_fanout = true;
  const result = validateFieldModePayload(unsafe);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('automatic_execution_must_be_false'));
  assert.ok(result.errors.includes('automatic_category_fanout_must_be_false'));
});

test('preserves site counts and review-target geometry', () => {
  const site = siteSummary(fixture);
  assert.equal(site.existingPoiCount, 12);
  assert.equal(site.newPoiCount, 4);
  assert.equal(site.reviewTargetCount, 1);
  assert.equal(site.minimumSpacingBand, 'COMPROMISE_40');

  const geojson = reviewTargetsGeoJSON(fixture);
  assert.equal(geojson.features.length, 1);
  assert.equal(geojson.features[0].properties.target_class, 'MOVABLE_NEW');
  assert.equal(geojson.features[0].properties.spacing_band, 'COMPROMISE_40');
  assert.deepEqual(geojson.features[0].geometry.coordinates, [139.8628, 35.6407]);
});

test('keeps category execution state explicit', () => {
  const facility = categorySummary(fixture, 'facility');
  const road = categorySummary(fixture, 'road');
  assert.equal(facility.dataState, 'NOT_RUN');
  assert.deepEqual(facility.facts, {});
  assert.equal(road.dataState, 'EXECUTED');
  assert.equal(road.facts.nearest_road_edge_m, 7.25);
  assert.equal(road.needsFieldCheck, true);
});
