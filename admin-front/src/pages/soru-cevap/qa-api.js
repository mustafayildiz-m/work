import { toast } from 'sonner';
import { I18N_CONFIG_KEY } from '@/i18n/config';
import enMessages from '@/i18n/messages/en.json';
import trMessages from '@/i18n/messages/tr.json';
import kyMessages from '@/i18n/messages/ky.json';

const API_MESSAGES = { en: enMessages, tr: trMessages, ky: kyMessages };

function getAdminLocale() {
  try {
    const raw = localStorage.getItem(I18N_CONFIG_KEY);
    const cfg = raw ? JSON.parse(raw) : null;
    const code = cfg?.code || 'en';
    return API_MESSAGES[code] ? code : 'en';
  } catch {
    return 'en';
  }
}

function qaMsg(key) {
  const locale = getAdminLocale();
  return API_MESSAGES[locale][key] || API_MESSAGES.en[key] || key;
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getToken() {
  return localStorage.getItem('access_token');
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function qaFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: authHeaders(options.headers || {}),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `${qaMsg('QA.REQUEST_FAILED')} (${res.status})`;
    if (res.status === 401) {
      toast.error(qaMsg('QA.SESSION_EXPIRED'));
    }
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
}

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function flattenCategories(categories) {
  const list = ensureArray(categories);
  const result = [];
  const seen = new Set();

  const walk = (items, depth = 0) => {
    for (const item of ensureArray(items)) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      result.push({ ...item, depth });
      if (item.children?.length) walk(item.children, depth + 1);
    }
  };

  const roots = list.filter((c) => !c.parentId);
  walk(roots.length ? roots : list);
  return result;
}

export function categoryLabel(category, depth = 0) {
  const name = category?.translations?.[0]?.name || qaMsg('QA.CATEGORY_FALLBACK').replace('{id}', category?.id);
  return `${depth > 0 ? '— '.repeat(depth) : ''}${name}`;
}
