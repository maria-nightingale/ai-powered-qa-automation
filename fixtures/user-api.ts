import { getCleanupApiToken } from './program-api';

type JsonRecord = Record<string, unknown>;

export function extractUserId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const record = body as JsonRecord;
  const data = record.data;

  if (data && typeof data === 'object') {
    const nested = data as JsonRecord;
    if (typeof nested.id === 'string') {
      return nested.id;
    }
    if (typeof nested.uuid === 'string') {
      return nested.uuid;
    }
  }

  if (typeof record.id === 'string') {
    return record.id;
  }

  if (typeof record.uuid === 'string') {
    return record.uuid;
  }

  return undefined;
}

export async function deactivateUsers(ids: string[]): Promise<void> {
  const baseUrl = (process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio').replace(/\/$/, '');
  const token = await getCleanupApiToken();

  if (!token) {
    console.warn('Could not obtain API token; cannot deactivate users:', ids);
    return;
  }

  for (const id of ids) {
    try {
      const res = await fetch(`${baseUrl}/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ is_active: false }),
      });
      if (!res.ok) {
        console.warn(`Failed to deactivate user ${id}: ${res.status}`);
      }
    } catch (error) {
      console.warn(`Failed to deactivate user ${id}:`, error);
    }
  }
}
