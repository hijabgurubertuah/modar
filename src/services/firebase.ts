// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Material, MaterialPage, CMSSettings, GradeSettings, SyncConfig } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification: ', JSON.stringify(errInfo));
}

// Test connection on startup safely with timeout
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const checkPromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    );
    await Promise.race([checkPromise, timeoutPromise]);
    return true;
  } catch {
    // If server didn't respond within 3s or offline, operate in offline cache mode silently
    return false;
  }
}

// Firestore listeners for Realtime Synchronization
export function subscribeToMaterials(
  onUpdate: (materials: Material[]) => void
) {
  try {
    return onSnapshot(
      collection(db, 'materials'),
      (snapshot) => {
        const list: Material[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Material);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'materials');
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'materials');
    return () => {};
  }
}

export function subscribeToPages(
  onUpdate: (pages: MaterialPage[]) => void
) {
  try {
    return onSnapshot(
      collection(db, 'pages'),
      (snapshot) => {
        const list: MaterialPage[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as MaterialPage);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'pages');
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'pages');
    return () => {};
  }
}

export function subscribeToSettings(
  onCmsUpdate: (cms: CMSSettings) => void,
  onGradeUpdate: (grades: GradeSettings) => void,
  onSyncUpdate: (sync: SyncConfig) => void
) {
  try {
    return onSnapshot(
      collection(db, 'settings'),
      (snapshot) => {
        snapshot.forEach((d) => {
          const data = d.data();
          if (d.id === 'cms' && data.cms) {
            onCmsUpdate(data.cms as CMSSettings);
          }
          if (d.id === 'grades' && data.grades) {
            onGradeUpdate(data.grades as GradeSettings);
          }
          if (d.id === 'sync' && data.sync) {
            onSyncUpdate(data.sync as SyncConfig);
          }
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'settings');
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'settings');
    return () => {};
  }
}

// Writers (Text-only to Firestore)
export async function syncMaterialToFirestore(material: Material) {
  try {
    await setDoc(doc(db, 'materials', material.id), material);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `materials/${material.id}`);
  }
}

export async function deleteMaterialFromFirestore(materialId: string) {
  try {
    await deleteDoc(doc(db, 'materials', materialId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `materials/${materialId}`);
  }
}

export async function syncPageToFirestore(page: MaterialPage) {
  try {
    await setDoc(doc(db, 'pages', page.id), page);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `pages/${page.id}`);
  }
}

export async function deletePageFromFirestore(pageId: string) {
  try {
    await deleteDoc(doc(db, 'pages', pageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `pages/${pageId}`);
  }
}

export async function syncCmsToFirestore(cms: CMSSettings) {
  try {
    await setDoc(doc(db, 'settings', 'cms'), { cms });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/cms');
  }
}

export async function syncGradeSettingsToFirestore(grades: GradeSettings) {
  try {
    await setDoc(doc(db, 'settings', 'grades'), { grades });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/grades');
  }
}

export async function syncConfigToFirestore(sync: SyncConfig) {
  try {
    await setDoc(doc(db, 'settings', 'sync'), { sync });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/sync');
  }
}

// Seed initial text data if Firestore is empty
export async function seedInitialDataIfNeeded(
  initialMaterials: Material[],
  initialPages: MaterialPage[],
  initialCms: CMSSettings,
  initialGrades: GradeSettings,
  initialSync: SyncConfig
) {
  try {
    const existing = await getDocs(collection(db, 'materials'));
    if (existing.empty) {
      for (const m of initialMaterials) {
        await setDoc(doc(db, 'materials', m.id), m);
      }
      for (const p of initialPages) {
        await setDoc(doc(db, 'pages', p.id), p);
      }
      await setDoc(doc(db, 'settings', 'cms'), { cms: initialCms });
      await setDoc(doc(db, 'settings', 'grades'), { grades: initialGrades });
      await setDoc(doc(db, 'settings', 'sync'), { sync: initialSync });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed');
  }
}
