export const FIELD_MODE_CONTRACT_VERSION = '0.1.0';
export const FIELD_MODE_STORAGE_KEY = 'campsite.field_mode_payload.v0.1';
export const CORE_CATEGORIES = ['facility', 'road', 'crowd'];

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateFieldModePayload(payload) {
  const errors = [];
  if (!isObject(payload)) return { ok: false, errors: ['payload_not_object'] };

  if (payload.source !== 'CAMPSITE_AI_HEADQUARTERS') errors.push('source_mismatch');
  if (payload.mode !== 'FIELD_MODE') errors.push('mode_mismatch');
  if (payload.contract_version !== FIELD_MODE_CONTRACT_VERSION) errors.push('contract_version_mismatch');
  if (payload.read_only !== true) errors.push('read_only_required');
  if (payload.automatic_execution !== false) errors.push('automatic_execution_must_be_false');
  if (payload.automatic_category_fanout !== false) errors.push('automatic_category_fanout_must_be_false');

  const policy = isObject(payload.decision_policy) ? payload.decision_policy : {};
  if (policy.decision_owner !== 'human') errors.push('decision_owner_must_be_human');
  if (policy.field_mode_may_execute_categories !== false) errors.push('field_mode_execution_must_be_false');
  if (policy.field_mode_may_expand_targets !== false) errors.push('field_mode_target_expansion_must_be_false');

  const categories = isObject(payload.core_categories) ? payload.core_categories : null;
  if (!categories) {
    errors.push('core_categories_missing');
  } else {
    for (const name of CORE_CATEGORIES) {
      if (!isObject(categories[name])) errors.push(`core_category_missing:${name}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function siteSummary(payload) {
  const site = isObject(payload?.site) ? payload.site : {};
  const proposal = isObject(payload?.proposal) ? payload.proposal : {};
  const reviewTargets = Array.isArray(payload?.review_targets) ? payload.review_targets : [];
  return {
    proposalId: proposal.proposal_id ?? site.proposal_id ?? null,
    artifactName: proposal.artifact_name ?? null,
    existingPoiCount: numberOrNull(site.existing_poi_count),
    newPoiCount: numberOrNull(site.new_poi_count),
    reviewTargetCount: numberOrNull(site.review_target_count) ?? reviewTargets.length,
    minimumSpacingM: numberOrNull(site.minimum_new_to_any_poi_distance_m),
    minimumSpacingBand: site.minimum_spacing_band ?? null,
    focalCoordinate: normalizeCoordinate(site.focal_coordinate ?? site.centroid),
    activityAreaGeometry: normalizeGeometry(site.activity_area_geometry),
  };
}

export function categorySummary(payload, categoryName) {
  if (!CORE_CATEGORIES.includes(categoryName)) return null;
  const category = isObject(payload?.core_categories?.[categoryName]) ? payload.core_categories[categoryName] : {};
  return {
    category: categoryName,
    dataState: category.data_state ?? 'NOT_RUN',
    status: category.status ?? 'NOT_RUN',
    confidence: category.confidence ?? 'UNKNOWN',
    needsFieldCheck: typeof category.needs_field_check === 'boolean' ? category.needs_field_check : null,
    observedAt: category.observed_at ?? null,
    facts: isObject(category.facts) ? category.facts : {},
    sources: Array.isArray(category.sources) ? category.sources : [],
    flags: Array.isArray(category.flags) ? category.flags : [],
    limitations: Array.isArray(category.limitations) ? category.limitations : [],
    selection: isObject(category.selection) ? category.selection : {},
  };
}

export function reviewTargetsGeoJSON(payload) {
  const targets = Array.isArray(payload?.review_targets) ? payload.review_targets : [];
  const features = targets.flatMap(target => {
    if (!isObject(target)) return [];
    const coordinate = normalizeCoordinate(target.coordinate);
    if (!coordinate) return [];
    return [{
      type: 'Feature',
      properties: {
        target_id: String(target.target_id ?? ''),
        target_class: String(target.target_class ?? ''),
        poi_type: String(target.poi_type ?? ''),
        name: String(target.name ?? ''),
        review_state: String(target.review_state ?? ''),
        spacing_band: String(target.spacing?.spacing_band ?? ''),
        nearest_distance_m: numberOrNull(target.spacing?.nearest_distance_m),
      },
      geometry: { type: 'Point', coordinates: [coordinate.lon, coordinate.lat] },
    }];
  });
  return { type: 'FeatureCollection', features };
}

export function focalPointGeoJSON(payload) {
  const coordinate = siteSummary(payload).focalCoordinate;
  return {
    type: 'FeatureCollection',
    features: coordinate ? [{
      type: 'Feature',
      properties: { kind: 'SITE_FOCAL' },
      geometry: { type: 'Point', coordinates: [coordinate.lon, coordinate.lat] },
    }] : [],
  };
}

export function normalizeGeometry(value) {
  if (!isObject(value)) return null;
  if (!['Polygon', 'MultiPolygon'].includes(value.type)) return null;
  if (!Array.isArray(value.coordinates)) return null;
  return value;
}

export function normalizeCoordinate(value) {
  if (!isObject(value)) return null;
  const lat = numberOrNull(value.lat ?? value.latitude);
  const lon = numberOrNull(value.lon ?? value.lng ?? value.longitude);
  if (lat === null || lon === null) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
