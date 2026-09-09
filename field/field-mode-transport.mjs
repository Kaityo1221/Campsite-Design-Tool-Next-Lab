export const FIELD_TRANSFER_NAME = 'CAMPSITE_FIELD_HANDOFF';
export const FIELD_TRANSFER_VERSION = '0.1.0';

function decodeBase64UrlBytes(token) {
  const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function decodeFieldTransferToken(token) {
  if (typeof token !== 'string' || !token) throw new Error('missing_field_transfer_token');
  try {
    const text = new TextDecoder().decode(decodeBase64UrlBytes(token));
    const envelope = JSON.parse(text);
    if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
      throw new Error('field_transfer_envelope_must_be_object');
    }
    return envelope;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('field_transfer_')) throw error;
    throw new Error('invalid_field_transfer_token');
  }
}

export function validateFieldTransferEnvelope(envelope) {
  const errors = [];
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return { ok: false, errors: ['envelope_must_be_object'] };
  }
  if (envelope.transport !== FIELD_TRANSFER_NAME) errors.push('transport_mismatch');
  if (envelope.transport_version !== FIELD_TRANSFER_VERSION) errors.push('transport_version_mismatch');
  if (!envelope.payload || typeof envelope.payload !== 'object' || Array.isArray(envelope.payload)) errors.push('payload_missing');
  const binding = envelope.binding;
  if (!binding || typeof binding !== 'object' || Array.isArray(binding)) errors.push('binding_missing');
  else {
    if (binding.state !== 'UNBOUND') errors.push('binding_must_arrive_unbound');
    if (binding.decision_owner !== 'human') errors.push('binding_decision_owner_must_be_human');
  }
  return { ok: errors.length === 0, errors };
}

export function transferTokenFromLocation(locationLike = location) {
  const hash = String(locationLike.hash || '').replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const token = params.get('fieldTransfer');
  return token || null;
}
