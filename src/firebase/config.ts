import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Notebook, ReadingStreakData } from '../types';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: Must pass databaseId from firebase-applet-config.json */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Error handling conforming to Firebase skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or connecting...');
    }
  }
}

// Auto-run connection test
testConnection();

/**
 * Authentication Methods
 */
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Save or update user profile document
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Leitor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return result.user;
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
}

export async function registerWithEmail(email: string, pass: string, name?: string) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && res.user) {
      await updateProfile(res.user, { displayName: name });
    }
    if (res.user) {
      await setDoc(
        doc(db, 'users', res.user.uid),
        {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: name || email.split('@')[0] || 'Leitor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    return res.user;
  } catch (err: any) {
    console.error('Email Registration Error:', err);
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (err: any) {
    console.error('Email Sign-In Error:', err);
    throw err;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign Out Error:', err);
    throw err;
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    console.error('Reset Password Error:', err);
    throw err;
  }
}

/**
 * Notebook Storage in Firestore
 * Strictly stored under `/users/{userId}/notebooks/{notebookId}`
 * Completely isolated from other users' accounts!
 */
export function subscribeToUserNotebooks(
  userId: string,
  onData: (notebooks: Notebook[]) => void,
  onError?: (err: any) => void
) {
  const collectionPath = `users/${userId}/notebooks`;
  const notebooksCol = collection(db, 'users', userId, 'notebooks');

  return onSnapshot(
    notebooksCol,
    (snapshot) => {
      const list: Notebook[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Notebook);
      });
      // Sort by updatedAt descending
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, collectionPath);
      if (onError) onError(err);
    }
  );
}

export async function saveNotebookToFirestore(userId: string, notebook: Notebook): Promise<void> {
  const docPath = `users/${userId}/notebooks/${notebook.id}`;
  try {
    const payload = {
      ...notebook,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'notebooks', notebook.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function deleteNotebookFromFirestore(userId: string, notebookId: string): Promise<void> {
  const docPath = `users/${userId}/notebooks/${notebookId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'notebooks', notebookId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

export async function batchSaveNotebooksToFirestore(userId: string, notebooks: Notebook[]): Promise<void> {
  const collectionPath = `users/${userId}/notebooks`;
  try {
    const batch = writeBatch(db);
    for (const nb of notebooks) {
      const ref = doc(db, 'users', userId, 'notebooks', nb.id);
      batch.set(
        ref,
        {
          ...nb,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, collectionPath);
  }
}

export async function clearAllUserNotebooksFromFirestore(userId: string): Promise<void> {
  const collectionPath = `users/${userId}/notebooks`;
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'notebooks'));
    const batch = writeBatch(db);
    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, collectionPath);
  }
}

/**
 * Reading Streak Persistence in Firestore
 * Listens to /users/{userId} to retrieve readingStreak
 */
export function subscribeToUserStreak(
  userId: string,
  onData: (streak: ReadingStreakData | null) => void,
  onError?: (err: any) => void
) {
  const docPath = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData((data.readingStreak as ReadingStreakData) || null);
      } else {
        onData(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, docPath);
      if (onError) onError(err);
    }
  );
}

export async function saveUserStreakToFirestore(
  userId: string,
  email: string,
  streak: ReadingStreakData
): Promise<void> {
  const docPath = `users/${userId}`;
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        uid: userId,
        email,
        readingStreak: streak,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

