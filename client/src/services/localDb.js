/**
 * localDb.js — Phone Local Database & Cache (IndexedDB/SQLite engine)
 * Provides offline-first local persistence for:
 * - Chat history
 * - Personal notes and tasks (synchronized when online)
 * - Media files (Images, videos, PDFs in phone's local storage)
 * - Offline sync queue with MongoDB Atlas
 */

const DB_NAME = 'educonnect_phone_db';
const DB_VERSION = 1;

let dbInstance = null;

const getDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      // 1. Chat history local cache
      if (!db.objectStoreNames.contains('chat_messages')) {
        const store = db.createObjectStore('chat_messages', { keyPath: '_id' });
        store.createIndex('conversationId', 'conversationId', { unique: false });
      }

      // 2. Personal tasks local store
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: '_id' });
      }

      // 3. Personal notes local store
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: '_id' });
      }

      // 4. Media vault (Images, videos, PDFs in phone storage)
      if (!db.objectStoreNames.contains('media_vault')) {
        db.createObjectStore('media_vault', { keyPath: 'id' });
      }

      // 5. Offline mutation sync queue
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };

    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    req.onerror = (e) => {
      reject(e.target.error);
    };
  });
};

/* ------------------- Chat Messages Cache ------------------- */

export const getCachedMessages = async (conversationId) => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('chat_messages', 'readonly');
      const store = tx.objectStore('chat_messages');
      const index = store.index('conversationId');
      const req = index.getAll(conversationId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const saveCachedMessages = async (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) return;
  try {
    const db = await getDB();
    const tx = db.transaction('chat_messages', 'readwrite');
    const store = tx.objectStore('chat_messages');
    messages.forEach((m) => {
      if (m && m._id) store.put(m);
    });
  } catch (err) {
    console.warn('[LocalDB] Cache messages failed:', err);
  }
};

/* ------------------- Personal Tasks Store ------------------- */

export const getCachedTasks = async () => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('tasks', 'readonly');
      const store = tx.objectStore('tasks');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const saveCachedTasks = async (tasks) => {
  if (!Array.isArray(tasks)) return;
  try {
    const db = await getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    store.clear();
    tasks.forEach((t) => {
      if (t && t._id) store.put(t);
    });
  } catch (err) {
    console.warn('[LocalDB] Cache tasks failed:', err);
  }
};

/* ------------------- Personal Notes Store ------------------- */

export const getCachedNotes = async () => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

export const saveCachedNotes = async (notes) => {
  if (!Array.isArray(notes)) return;
  try {
    const db = await getDB();
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    store.clear();
    notes.forEach((n) => {
      if (n && n._id) store.put(n);
    });
  } catch (err) {
    console.warn('[LocalDB] Cache notes failed:', err);
  }
};

/* ------------------- Media Vault (Phone Storage) ------------------- */

export const saveMediaFile = async ({ id, name, fileType, size, dataUrl }) => {
  try {
    const db = await getDB();
    const tx = db.transaction('media_vault', 'readwrite');
    const store = tx.objectStore('media_vault');
    store.put({ id, name, fileType, size, dataUrl, savedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[LocalDB] Save media file failed:', err);
  }
};

export const getMediaFile = async (id) => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('media_vault', 'readonly');
      const store = tx.objectStore('media_vault');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/* ------------------- Local Storage Stats & Cloud Sync ------------------- */

export const getLocalStorageStats = async () => {
  try {
    const db = await getDB();
    const countStore = (storeName) =>
      new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });

    const [tasksCount, notesCount, messagesCount, mediaCount] = await Promise.all([
      countStore('tasks'),
      countStore('notes'),
      countStore('chat_messages'),
      countStore('media_vault'),
    ]);

    return {
      tasksCount,
      notesCount,
      messagesCount,
      mediaCount,
      storageType: 'Phone SQLite/IndexedDB Storage',
      backupTarget: 'MongoDB Atlas (mca_chat)',
    };
  } catch {
    return {
      tasksCount: 0,
      notesCount: 0,
      messagesCount: 0,
      mediaCount: 0,
      storageType: 'Phone Local Storage',
      backupTarget: 'MongoDB Atlas',
    };
  }
};
