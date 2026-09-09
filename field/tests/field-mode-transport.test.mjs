import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  FIELD_TRANSFER_NAME,
  FIELD_TRANSFER_VERSION,
  decodeFieldTransferToken,
  transferTokenFromLocation,
  validateFieldTransferEnvelope,
} from '../field-mode-transport.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(await readFile(resolve(here, '../fixtures/field-mode-sample-v0.1.json'), 'utf8'));

function encodeEnvelope(envelope) {
  return Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64url');
}

function envelope() {
  return {
    transport: FIELD_TRANSFER_NAME,
    transport_version: FIELD_TRANSFER_VERSION,
    payload: fixture,
    binding: {
      state: 'UNBOUND',
      decision_owner: 'human',
      proposal_id: fixture.proposal.proposal_id,
      artifact_name: fixture.proposal.artifact_name,
    },
  };
}

test('decodes a UTF-8 base64url Headquarters packet', () => {
  const token = encodeEnvelope(envelope());
  const decoded = decodeFieldTransferToken(token);
  assert.equal(decoded.transport, FIELD_TRANSFER_NAME);
  assert.equal(decoded.binding.state, 'UNBOUND');
  assert.equal(decoded.payload.proposal.artifact_name, fixture.proposal.artifact_name);
});

test('requires fragment transport to arrive UNBOUND and human-owned', () => {
  const unsafe = envelope();
  unsafe.binding.state = 'BOUND';
  unsafe.binding.decision_owner = 'automatic';
  const result = validateFieldTransferEnvelope(unsafe);
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('binding_must_arrive_unbound'));
  assert.ok(result.errors.includes('binding_decision_owner_must_be_human'));
});

test('extracts fieldTransfer only from the URL fragment', () => {
  const token = encodeEnvelope(envelope());
  const locationLike = {
    hash: `#fieldTransfer=${token}`,
    search: '?fieldTransfer=should-not-be-read',
  };
  assert.equal(transferTokenFromLocation(locationLike), token);
});

test('browser consumer exposes explicit human binding instead of auto-binding', async () => {
  const consumer = await readFile(resolve(here, '../field-mode-consumer.js'), 'utf8');
  assert.match(consumer, /transferTokenFromLocation/);
  assert.match(consumer, /この候補をHQ案件として接続/);
  assert.match(consumer, /url\.searchParams\.set\('fieldBind', '1'\)/);
  assert.doesNotMatch(consumer, /fieldBind.*fragment/);
});
