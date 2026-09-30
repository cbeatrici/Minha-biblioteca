import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Header } from './components/Header';
import { NotebookList } from './components/NotebookList';
import { NotebookDetailView } from './components/NotebookDetailView';
import { AllHighlightsArchiveView } from './components/AllHighlightsArchiveView';
import { AllFlashcardsHubView } from './components/AllFlashcardsHubView';
import { HistoryExplorerHubView } from './components/HistoryExplorerHubView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NewNotebookModal } from './components/NewNotebookModal';
import { SyncExportModal } from './components/SyncExportModal';
import { AuthGate } from './components/AuthGate';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { MobileTabBar } from './components/MobileTabBar';
import { ReadingStreakModal } from './components/ReadingStreakModal';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { Notebook, ActiveView, ReadingStreakData } from './types';
import {
  auth,
  subscribeToUserNotebooks,
  saveNotebookToFirestore,
  deleteNotebookFromFirestore,
  batchSaveNotebooksToFirestore,
  clearAllUserNotebooksFromFirestore,
  subscribeToUserStreak,
  saveUserStreakToFirestore,
  logoutUser,
} from './firebase/config';
import { DEFAULT_STREAK, recordReadingSession, getEffectiveStreak } from './utils/streakUtils';
import { SEED_NOTEBOOKS } from './data/seedData';
import { hasSeenTour, markTourSeen } from './utils/storage';

export default function App() {
  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // User's Real-time Cloud Notebooks
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Reading Streak Motivation State
  const [streakData, setStreakData] = useState<ReadingStreakData>(DEFAULT_STREAK);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState<boolean>(false);

  // Walkthrough Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('notebooks');
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // 1. Listen to Firebase Authentication State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);

      if (user) {
        // Check if user has seen onboarding tour
        if (!hasSeenTour(user.email || user.uid)) {
          setIsTourOpen(true);
        }
      } else {
        setNotebooks([]);
        setStreakData(DEFAULT_STREAK);
        setSelectedNotebookId(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore Sync for Authenticated User
  // Subscribes strictly to /users/{userId}/notebooks
  // Completely isolated - will NEVER mix with another user's account!
  useEffect(() => {
    if (!firebaseUser) {
      setNotebooks([]);
      return;
    }

    setDataLoading(true);
    const unsubscribeNotebooks = subscribeToUserNotebooks(
      firebaseUser.uid,
      (remoteNotebooks) => {
        setNotebooks(remoteNotebooks);
        setDataLoading(false);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setDataLoading(false);
      }
    );

    // Subscribe to Reading Streak in Firestore
    const unsubscribeStreak = subscribeToUserStreak(
      firebaseUser.uid,
      (remoteStreak) => {
        if (remoteStreak) {
          setStreakData(remoteStreak);
        }
      },
      (err) => {
        console.error('Streak subscription error:', err);
      }
    );

    return () => {
      unsubscribeNotebooks();
      unsubscribeStreak();
    };
  }, [firebaseUser]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Aggregated Stats
  const totalHighlights = notebooks.reduce((acc, nb) => acc + (nb.highlights?.length || 0), 0);
  const totalFlashcards = notebooks.reduce((acc, nb) => acc + (nb.flashcards?.length || 0), 0);

  // Selected Notebook Object
  const selectedNotebook = selectedNotebookId
    ? notebooks.find((nb) => nb.id === selectedNotebookId) || null
    : null;

  // Streak Update Handler
  const handleUpdateStreak = async (updated: ReadingStreakData) => {
    setStreakData(updated);
    if (firebaseUser) {
      await saveUserStreakToFirestore(firebaseUser.uid, firebaseUser.email || '', updated);
    }
  };

  // Handlers
  const handleSelectNotebook = (notebook: Notebook) => {
    setSelectedNotebookId(notebook.id);
    setActiveView('notebook-detail');
  };

  const handleUpdateNotebook = async (updated: Notebook) => {
    if (!firebaseUser) return;
    const withUser = {
      ...updated,
      userId: firebaseUser.uid,
    };

    const previousNotebook = notebooks.find((nb) => nb.id === updated.id);
    // Optimistic local state update
    setNotebooks((prev) => prev.map((nb) => (nb.id === withUser.id ? withUser : nb)));
    // Persist to user's isolated Firestore subcollection
    await saveNotebookToFirestore(firebaseUser.uid, withUser);

    // Auto-credit streak if user added new highlights or scans today
    const prevHighlightCount = previousNotebook?.highlights?.length || 0;
    const newHighlightCount = updated.highlights?.length || 0;
    const prevScanCount = previousNotebook?.pageScans?.length || 0;
    const newScanCount = updated.pageScans?.length || 0;

    if (newHighlightCount > prevHighlightCount || newScanCount > prevScanCount) {
      const effective = getEffectiveStreak(streakData);
      if (!effective.readToday) {
        const { updatedStreak } = recordReadingSession(
          streakData,
          15,
          updated.title,
          'Anotações e grifos registrados'
        );
        handleUpdateStreak(updatedStreak);
      }
    }
  };

  const handleDeleteNotebook = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este livro e todas as suas citações?')) {
      setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
      if (selectedNotebookId === id) {
        setSelectedNotebookId(null);
        setActiveView('notebooks');
      }
      if (firebaseUser) {
        await deleteNotebookFromFirestore(firebaseUser.uid, id);
      }
    }
  };

  const handleCreateNotebook = async (newNotebook: Notebook) => {
    if (!firebaseUser) return;
    const withUser: Notebook = {
      ...newNotebook,
      userId: firebaseUser.uid,
    };
    setNotebooks((prev) => [withUser, ...prev]);
    setSelectedNotebookId(withUser.id);
    setActiveView('notebook-detail');
    // Save to user's isolated Firestore collection
    await saveNotebookToFirestore(firebaseUser.uid, withUser);

    // Reading session automatic reward for creating/reading a book
    const effective = getEffectiveStreak(streakData);
    if (!effective.readToday) {
      const { updatedStreak } = recordReadingSession(
        streakData,
        15,
        newNotebook.title,
        'Novo livro iniciado'
      );
      handleUpdateStreak(updatedStreak);
    }
  };

  const handleImportSuccess = async (imported: Notebook[]) => {
    if (!firebaseUser) return;
    const withUser = imported.map((nb) => ({ ...nb, userId: firebaseUser.uid }));
    setNotebooks(withUser);
    await batchSaveNotebooksToFirestore(firebaseUser.uid, withUser);
    setActiveView('notebooks');
  };

  const handleClearAll = async () => {
    if (window.confirm('Tem certeza de que deseja zerar todos os livros e começar do zero? Esta ação é irreversível.')) {
      setNotebooks([]);
      setSelectedNotebookId(null);
      setActiveView('notebooks');
      if (firebaseUser) {
        await clearAllUserNotebooksFromFirestore(firebaseUser.uid);
      }
    }
  };

  const handleLoadSeed = async () => {
    if (!firebaseUser) return;
    const withUser = SEED_NOTEBOOKS.map((nb) => ({
      ...nb,
      userId: firebaseUser.uid,
      id: `seed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    setNotebooks(withUser);
    await batchSaveNotebooksToFirestore(firebaseUser.uid, withUser);
    setActiveView('notebooks');
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      await logoutUser();
      setNotebooks([]);
      setSelectedNotebookId(null);
      setStreakData(DEFAULT_STREAK);
    }
  };

  const handleCloseTour = () => {
    if (firebaseUser) {
      markTourSeen(firebaseUser.email || firebaseUser.uid);
    }
    setIsTourOpen(false);
  };

  // 1. Initial Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C86D51] to-[#A85138] flex items-center justify-center text-white shadow-md animate-pulse">
          <span className="font-serif font-bold text-xl">L</span>
        </div>
        <p className="text-sm font-medium text-[#78716A]">Carregando App de Leitura...</p>
      </div>
    );
  }

  // 2. Mandatory Authentication Gate
  if (!firebaseUser) {
    return <AuthGate />;
  }

  // 3. Authenticated App Experience
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A443F] flex flex-col font-sans selection:bg-[#C86D51] selection:text-white pb-16 md:pb-0">
      {/* Sticky Header with Reading Streak Badge */}
      <Header
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view !== 'notebook-detail') {
            setSelectedNotebookId(null);
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNewNotebook={() => setIsNewNotebookOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenAuth={() => {}}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={{
          email: firebaseUser.email || 'Conta Google',
          token: firebaseUser.uid,
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        }}
        onLogout={handleLogout}
        totalNotebooks={notebooks.length}
        totalHighlights={totalHighlights}
        totalFlashcards={totalFlashcards}
        streakData={streakData}
        onOpenStreak={() => setIsStreakModalOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {dataLoading && notebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#C86D51] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#78716A]">Sincronizando seus livros da nuvem...</p>
          </div>
        ) : (
          <>
            {/* Notebooks Grid Library */}
            {activeView === 'notebooks' && (
              <NotebookList
                notebooks={notebooks}
                onSelectNotebook={handleSelectNotebook}
                onOpenNewNotebook={() => setIsNewNotebookOpen(true)}
                onDeleteNotebook={handleDeleteNotebook}
                onResetHistory={handleClearAll}
              />
            )}

            {/* Individual Notebook Detail Workspace */}
            {activeView === 'notebook-detail' && selectedNotebook && (
              <NotebookDetailView
                notebook={selectedNotebook}
                onBack={() => {
                  setSelectedNotebookId(null);
                  setActiveView('notebooks');
                }}
                onUpdateNotebook={handleUpdateNotebook}
                onDeleteNotebook={(id) => handleDeleteNotebook(id)}
              />
            )}

            {/* Global Highlights Archive */}
            {activeView === 'highlights-archive' && (
              <AllHighlightsArchiveView
                notebooks={notebooks}
                onSelectNotebook={handleSelectNotebook}
              />
            )}

            {/* Global Flashcards Study Hub */}
            {activeView === 'flashcards-hub' && (
              <AllFlashcardsHubView
                notebooks={notebooks}
                onSelectNotebook={handleSelectNotebook}
                onUpdateNotebook={handleUpdateNotebook}
              />
            )}

            {/* Author Historical Context Explorer */}
            {activeView === 'history-explorer' && (
              <HistoryExplorerHubView
                notebooks={notebooks}
                onSelectNotebook={handleSelectNotebook}
                onUpdateNotebook={handleUpdateNotebook}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Tab Bar with Streak Indicator */}
      <MobileTabBar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view !== 'notebook-detail') {
            setSelectedNotebookId(null);
          }
        }}
        onOpenNewNotebook={() => setIsNewNotebookOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        totalNotebooks={notebooks.length}
        totalHighlights={totalHighlights}
        totalFlashcards={totalFlashcards}
        streakData={streakData}
        onOpenStreak={() => setIsStreakModalOpen(true)}
      />

      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearchModal
          notebooks={notebooks}
          onSelectNotebook={handleSelectNotebook}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* New Notebook Modal */}
      {isNewNotebookOpen && (
        <NewNotebookModal
          onSave={handleCreateNotebook}
          onClose={() => setIsNewNotebookOpen(false)}
        />
      )}

      {/* Mobile/Web Sync & JSON Export Modal */}
      {isSyncOpen && (
        <SyncExportModal
          notebooks={notebooks}
          onImportSuccess={handleImportSuccess}
          onClearAll={handleClearAll}
          onLoadSeed={handleLoadSeed}
          onClose={() => setIsSyncOpen(false)}
        />
      )}

      {/* Reading Streak Motivation Hub Modal */}
      <ReadingStreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streakData={streakData}
        onUpdateStreak={handleUpdateStreak}
        notebooks={notebooks}
      />

      {/* First-time / Guide Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        userEmail={firebaseUser.email || undefined}
      />

      {/* Settings Modal (Language toggle, sync, account info) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userEmail={firebaseUser.email || undefined}
        totalNotebooks={notebooks.length}
      />
    </div>
  );
}
