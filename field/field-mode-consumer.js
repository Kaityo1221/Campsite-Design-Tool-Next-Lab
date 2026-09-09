import {
  FIELD_MODE_STORAGE_KEY,
  CORE_CATEGORIES,
  validateFieldModePayload,
  siteSummary,
  categorySummary,
  reviewTargetsGeoJSON,
  focalPointGeoJSON,
} from './field-mode-contract.mjs';

const FACT_LABELS = {
  nearest_road_edge_m: '最寄り道路縁',
  road_edge_count_within_radius: '調査範囲内の道路縁',
  park_name: '公園名',
  inside_park: '公園内',
  resident_population_count_within_radius: '調査圏の推計居住人口',
  containing_mesh_population_count: '所在500mメッシュ人口',
  population_mesh_count_within_radius: '人口推計メッシュ数',
  station_ridership_passenger_counts_per_day: '最寄り駅利用者数/日',
  population_estimate_is_approximate: '人口推計は概算',
};

const CATEGORY_CARD_IDS = {
  road: 'briefRoad',
  facility: 'briefFacility',
  crowd: 'briefCrowd',
};

function queryFlag(name) {
  const value = new URLSearchParams(location.search).get(name);
  return value === '1' || value === 'true' || value === 'active';
}

async function readPayload() {
  if (window.__CAMPSITE_FIELD_MODE_PAYLOAD__ && typeof window.__CAMPSITE_FIELD_MODE_PAYLOAD__ === 'object') {
    return { payload: window.__CAMPSITE_FIELD_MODE_PAYLOAD__, source: 'window' };
  }

  const params = new URLSearchParams(location.search);
  const payloadUrl = params.get('fieldPayloadUrl');
  if (payloadUrl) {
    const resolved = new URL(payloadUrl, location.href);
    const response = await fetch(resolved, { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error(`FIELD payload HTTP ${response.status}`);
    return { payload: await response.json(), source: 'url' };
  }

  try {
    const stored = sessionStorage.getItem(FIELD_MODE_STORAGE_KEY);
    if (stored) return { payload: JSON.parse(stored), source: 'session' };
  } catch (error) {
    console.warn('[FIELD MODE] session payload read failed', error);
  }
  return null;
}

function persistPayload(payload) {
  try {
    sessionStorage.setItem(FIELD_MODE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[FIELD MODE] session payload write failed', error);
  }
}

function installStyles() {
  if (document.getElementById('field-mode-consumer-style')) return;
  const style = document.createElement('style');
  style.id = 'field-mode-consumer-style';
  style.textContent = `
    .field-ai-summary{margin:0 0 13px;padding:12px 13px;border-radius:16px;border:1px solid rgba(31,114,86,.18);background:rgba(245,252,248,.92);box-shadow:0 8px 18px rgba(26,75,56,.07)}
    .field-ai-summary .eyebrow{font-size:9px;font-weight:950;letter-spacing:.12em;color:#2d7759}
    .field-ai-summary strong{display:block;margin-top:4px;font-size:13px;color:#173f32}
    .field-ai-summary .meta{margin-top:5px;font-size:10px;line-height:1.55;color:#5a7067}
    .field-ai-summary .warn{margin-top:7px;font-size:9px;line-height:1.5;color:#8a6531}
    .ai-offline.field-ai-connected{color:#1e6c50;border-color:rgba(31,114,86,.25);background:rgba(237,249,242,.92)}
    .field-ai-map-legend{position:fixed;z-index:29;right:12px;top:calc(112px + env(safe-area-inset-top));width:min(54vw,220px);padding:9px 10px;border-radius:14px;border:1px solid rgba(24,73,57,.16);background:rgba(255,255,250,.94);box-shadow:0 8px 22px rgba(27,57,47,.13);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);font-size:9px;line-height:1.5;color:#566d64}
    .field-ai-map-legend b{display:block;color:#1f7256;font-size:10px;margin-bottom:2px}
    .field-ai-map-legend .tag{display:inline-block;margin-top:5px;padding:2px 6px;border-radius:999px;background:#e5f3e9;color:#28664e;font-weight:900}
  `;
  document.head.appendChild(style);
}

function formatFactValue(key, value) {
  if (typeof value === 'boolean') return value ? 'はい' : 'いいえ';
  if (typeof value === 'number') {
    if (key.endsWith('_m')) return `${value.toLocaleString('ja-JP')} m`;
    if (key.includes('population') || key.includes('count')) return value.toLocaleString('ja-JP');
    return String(value);
  }
  if (Array.isArray(value)) return value.map(item => typeof item === 'number' ? item.toLocaleString('ja-JP') : String(item)).join(' / ');
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value);
}

function categoryLines(summary) {
  if (!summary || summary.dataState !== 'EXECUTED') {
    return ['Headquartersでは未実行です。FIELD MODEから自動実行しません。'];
  }
  const lines = [];
  for (const [key, value] of Object.entries(summary.facts)) {
    const text = formatFactValue(key, value);
    if (!text) continue;
    lines.push(`${FACT_LABELS[key] ?? key}: ${text}`);
    if (lines.length >= 4) break;
  }
  if (summary.observedAt) lines.push(`観測時刻: ${summary.observedAt}`);
  if (summary.needsFieldCheck === true) lines.push('現地確認: 必要');
  else if (summary.needsFieldCheck === false) lines.push('現地確認: 不要（明示値）');
  else lines.push('現地確認: 未判定');
  if (!lines.length) lines.push('実行済みですが、表示できるfactsはありません。');
  return lines;
}

function categoryStateText(summary) {
  if (!summary || summary.dataState !== 'EXECUTED') return 'NOT RUN';
  return `${summary.status} / ${summary.confidence}`;
}

function renderBriefing(payload, bound) {
  const briefing = document.getElementById('briefingPage');
  if (!briefing) return;

  const badge = briefing.querySelector('.ai-offline');
  if (badge) {
    badge.classList.add('field-ai-connected');
    badge.textContent = bound ? 'CAMPSITE AI / READ ONLY' : 'HQ PAYLOAD / UNBOUND';
  }

  const site = siteSummary(payload);
  let summary = document.getElementById('fieldAiSummary');
  if (!summary) {
    summary = document.createElement('div');
    summary.id = 'fieldAiSummary';
    summary.className = 'field-ai-summary';
    const stack = briefing.querySelector('.briefing-stack');
    if (stack) stack.parentNode.insertBefore(summary, stack);
  }
  summary.replaceChildren();
  const eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'HEADQUARTERS PAYLOAD / v0.1';
  const title = document.createElement('strong');
  title.textContent = site.artifactName || site.proposalId || 'Headquarters案件';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const pieces = [];
  if (site.existingPoiCount !== null) pieces.push(`既存POI ${site.existingPoiCount}`);
  if (site.newPoiCount !== null) pieces.push(`新規POI ${site.newPoiCount}`);
  if (site.reviewTargetCount !== null) pieces.push(`確認対象 ${site.reviewTargetCount}`);
  if (site.minimumSpacingM !== null) pieces.push(`最小間隔 ${site.minimumSpacingM.toFixed(2)}m`);
  meta.textContent = pieces.join(' / ') || 'SITE情報あり';
  summary.append(eyebrow, title, meta);
  if (!bound) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    warn.textContent = '候補公園とのsite bindingが未確定のため、Core factsは候補A/B/Cへ貼り付けていません。';
    summary.appendChild(warn);
  }

  if (!bound) return;

  const poiPill = document.getElementById('briefingPoi');
  if (poiPill && site.existingPoiCount !== null) {
    poiPill.textContent = `既存POI ${site.existingPoiCount}${site.newPoiCount !== null ? ` / 新規 ${site.newPoiCount}` : ''}`;
  }

  for (const categoryName of CORE_CATEGORIES) {
    const card = document.getElementById(CATEGORY_CARD_IDS[categoryName]);
    if (!card) continue;
    const category = categorySummary(payload, categoryName);
    card.classList.add('ready');
    const state = card.querySelector('.brief-state');
    const text = card.querySelector('.brief-text');
    if (state) state.textContent = categoryStateText(category);
    if (text) text.textContent = categoryLines(category).join(' / ');
  }

  const note = briefing.querySelector('.briefing-note');
  if (note) {
    note.textContent = 'Campsite AI Headquartersの読み取り専用payloadを表示中です。FACILITY / ROAD / CROWDの未実行カテゴリはNOT RUNのまま表示し、FIELD MODEから自動実行・一括実行は行いません。';
  }
}

function renderExploreLegend(payload, bound) {
  if (!document.getElementById('poiInfo')) return;
  let legend = document.getElementById('fieldAiMapLegend');
  if (!legend) {
    legend = document.createElement('div');
    legend.id = 'fieldAiMapLegend';
    legend.className = 'field-ai-map-legend';
    document.body.appendChild(legend);
  }
  legend.replaceChildren();
  const title = document.createElement('b');
  title.textContent = bound ? 'Campsite AI / READ ONLY' : 'Headquarters payload detected';
  const text = document.createElement('div');
  const site = siteSummary(payload);
  text.textContent = bound
    ? `活動範囲と確認対象をHeadquarters payloadから重ねています。確認対象 ${site.reviewTargetCount ?? 0}件。`
    : 'この公園とのsite bindingは未確定です。AI/GIS overlayはまだ適用しません。';
  legend.append(title, text);
  if (bound) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'HQ OVERLAY';
    legend.appendChild(tag);
    const warn = document.createElement('div');
    warn.style.marginTop = '5px';
    warn.textContent = '既存の公園境界・POIは引き続きDEMO表示です。';
    legend.appendChild(warn);
  }
}

function addOrUpdateSource(map, id, data) {
  const source = map.getSource(id);
  if (source) source.setData(data);
  else map.addSource(id, { type: 'geojson', data });
}

function renderMapOverlays(payload, bound) {
  if (!bound) return;
  const map = window.__FIELD_MAP__;
  if (!map) return;

  const apply = () => {
    const site = siteSummary(payload);
    if (site.activityAreaGeometry) {
      const area = { type: 'Feature', properties: { kind: 'ACTIVITY_AREA' }, geometry: site.activityAreaGeometry };
      addOrUpdateSource(map, 'field-ai-activity-area', area);
      if (!map.getLayer('field-ai-activity-area-fill')) map.addLayer({ id: 'field-ai-activity-area-fill', type: 'fill', source: 'field-ai-activity-area', paint: { 'fill-color': '#1db6a0', 'fill-opacity': 0.10 } });
      if (!map.getLayer('field-ai-activity-area-line')) map.addLayer({ id: 'field-ai-activity-area-line', type: 'line', source: 'field-ai-activity-area', paint: { 'line-color': '#087f73', 'line-width': 3, 'line-opacity': 0.9 } });
    }

    addOrUpdateSource(map, 'field-ai-review-targets', reviewTargetsGeoJSON(payload));
    if (!map.getLayer('field-ai-review-targets-circle')) map.addLayer({ id: 'field-ai-review-targets-circle', type: 'circle', source: 'field-ai-review-targets', paint: { 'circle-radius': 7, 'circle-color': '#ffb54d', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });

    addOrUpdateSource(map, 'field-ai-site-focal', focalPointGeoJSON(payload));
    if (!map.getLayer('field-ai-site-focal-circle')) map.addLayer({ id: 'field-ai-site-focal-circle', type: 'circle', source: 'field-ai-site-focal', paint: { 'circle-radius': 6, 'circle-color': '#0b667f', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
  };

  if (typeof map.isStyleLoaded === 'function' && map.isStyleLoaded()) apply();
  else map.once('load', apply);
}

function announceConnection(payload, source, bound) {
  document.documentElement.dataset.fieldModePayload = 'connected';
  document.documentElement.dataset.fieldModeBinding = bound ? 'bound' : 'unbound';
  window.__CAMPSITE_FIELD_MODE_PAYLOAD__ = payload;
  window.__CAMPSITE_FIELD_MODE_CONSUMER__ = {
    source,
    bound,
    contractVersion: payload.contract_version,
    readOnly: true,
  };
}

export async function connectFieldModePayload() {
  installStyles();
  const loaded = await readPayload();
  if (!loaded) return { connected: false, reason: 'no_payload' };

  const validation = validateFieldModePayload(loaded.payload);
  if (!validation.ok) {
    console.warn('[FIELD MODE] payload rejected', validation.errors);
    return { connected: false, reason: 'invalid_payload', errors: validation.errors };
  }

  const bound = queryFlag('fieldBind');
  persistPayload(loaded.payload);
  announceConnection(loaded.payload, loaded.source, bound);
  renderBriefing(loaded.payload, bound);
  renderExploreLegend(loaded.payload, bound);
  renderMapOverlays(loaded.payload, bound);
  return { connected: true, bound, source: loaded.source };
}

connectFieldModePayload().catch(error => {
  console.error('[FIELD MODE] consumer failed', error);
});
