/**
 * LocalStorage storage helper with JSON validation, fallback handling, and backup tools.
 */

export const STORAGE_KEYS = {
  SCHEDULE: 'sadhana_schedule',
  DIET: 'sadhana_diet',
  LOGS: 'sadhana_logs',
  SETTINGS: 'sadhana_settings',
  CHAT_HISTORY: 'sadhana_chat_history'
};

export function loadStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error loading key ${key} from storage:`, error);
    return fallback;
  }
}

export function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving key ${key} to storage:`, error);
    return false;
  }
}

export function exportBackupData() {
  const backup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    schedule: loadStorage(STORAGE_KEYS.SCHEDULE, []),
    diet: loadStorage(STORAGE_KEYS.DIET, []),
    logs: loadStorage(STORAGE_KEYS.LOGS, []),
    settings: loadStorage(STORAGE_KEYS.SETTINGS, { webhookUrl: '', name: '' })
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sadhana-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackupData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.schedule) saveStorage(STORAGE_KEYS.SCHEDULE, data.schedule);
    if (data.diet) saveStorage(STORAGE_KEYS.DIET, data.diet);
    if (data.logs) saveStorage(STORAGE_KEYS.LOGS, data.logs);
    if (data.settings) saveStorage(STORAGE_KEYS.SETTINGS, data.settings);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: 'Format JSON tidak valid.' };
  }
}
