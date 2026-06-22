import { useEffect } from 'react';
import { useBujo, BujoProvider } from './context/BujoContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './features/auth/components/AuthScreen';
import { Toast } from './components/common/Toast';
import { CozyCabinBackground } from './components/common/CozyCabinBackground';
import { TutorialOverlay } from './components/common/TutorialOverlay';
import { FeatureHelpModal, FloatingHelpButton } from './components/common/FeatureHelpModal';
import { RapidLogModal, FloatingActionButton } from './components/common/RapidLog';
import { Header } from './features/planner/components/Header';
import { Sidebar } from './features/planner/components/Sidebar';
import { IndexTab } from './features/planner/components/IndexTab';
import { DailyLogTab } from './features/planner/components/DailyLogTab';
import { WeeklyLogTab } from './features/planner/components/WeeklyLogTab';
import { MonthlyLogTab } from './features/planner/components/MonthlyLogTab';
import { TimelineTab } from './features/planner/components/TimelineTab';
import { OverloadReliefModal } from './features/planner/components/OverloadReliefModal';
import { FutureLogTab } from './features/planner/components/FutureLogTab';
import { SettingsTab } from './features/settings/components/SettingsTab';
import { CollectionsLibrary } from './features/collections/components/CollectionsLibrary';
import { FocusMode } from './features/focus/components/FocusMode';
import { TrashTab } from './features/planner/components/TrashTab';
import { DreamBoardTab } from './features/planner/components/DreamBoardTab';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { LandingPageTab } from './features/planner/components/LandingPageTab';
import { GlobalSearchModal } from './features/planner/components/GlobalSearchModal';

function AppContent() {
  const {
    settings,
    setSettings,
    activeTab,
    setActiveTab,
    currentFontClass,
    toastMessage,
    showTutorial,
    setShowTutorial,
    showOverloadReliefModal,
    setShowOverloadReliefModal,
    showRapidLog,
    setShowRapidLog,
    rapidType,
    setRapidType,
    rapidText,
    setRapidText,
    handleRapidInputChange,
    handleRapidInputKeyDown,
    showAutocompleteRapid,
    collections,
    autocompleteIndexRapid,
    selectCollectionAutocompleteRapid,
    handleSaveRapidLog,
    rapidIcon,
    setRapidIcon,
    rapidDate,
    setRapidDate,
    rapidTime,
    setRapidTime,
    focoActive,
    expandedTaskId,
    setExpandedTaskId,
    setDeferredPrompt,
    setIsOnline,
    viewedFeatureHelp,
    setViewedFeatureHelp,
    setShowFeatureHelpModal
  } = useBujo();

  // Auto-trigger Feature Help on first visit
  useEffect(() => {
    if (!activeTab || activeTab === 'landing_page') return;
    
    // Check if the current tab has been viewed
    if (!viewedFeatureHelp[activeTab]) {
      // Small delay to allow tab transition animation
      const timer = setTimeout(() => {
        setShowFeatureHelpModal(true);
        setViewedFeatureHelp((prev: Record<string, boolean>) => ({ ...prev, [activeTab]: true }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, viewedFeatureHelp, setViewedFeatureHelp, setShowFeatureHelpModal]);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [setDeferredPrompt]);

  // Online/Offline Status Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  const filteredCollections = collections.filter((col: any) =>
    col.name.toLowerCase().includes((rapidText.match(/\[(.*)/)?.[1] || '').toLowerCase())
  );

  return (
    <div className={`relative layout-locked-viewport ${currentFontClass()} text-bujo-text bg-bujo-bg transition-colors duration-300`}>
      {/* Visual background element */}
      <CozyCabinBackground />

      {/* TOAST NOTIFICATION */}
      <Toast message={toastMessage} />

      {/* TUTORIAL OVERLAY */}
      <TutorialOverlay
        showTutorial={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          setSettings((prev: any) => ({ ...prev, firstTime: false }));
        }}
        setActiveTab={setActiveTab}
      />

      {/* CONTEXTUAL FEATURE HELP */}
      <FeatureHelpModal />
      <FloatingHelpButton />

      {/* HEADER NAVBAR */}
      <Header />

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 relative z-10 overflow-hidden">
        {focoActive ? (
          <FocusMode />
        ) : (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* SIDEBAR NAVIGATION PANEL */}
            <Sidebar />

            {/* DYNAMIC SCROLLABLE TAB WORKSPACE */}
            <main id="bujo-export-area" className={`flex-1 min-h-0 flex flex-col gap-6 pr-1 ${activeTab === 'daily_log' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              {activeTab === 'indice' && <IndexTab />}
              {activeTab === 'daily_log' && <DailyLogTab />}
              {activeTab === 'weekly_log' && <WeeklyLogTab />}
              {activeTab === 'monthly_log' && <MonthlyLogTab />}
              {activeTab === 'daily_spread' && <TimelineTab />}
              {activeTab === 'future_log' && <FutureLogTab />}
              {activeTab === 'settings' && <SettingsTab />}
              {activeTab === 'collections' && <CollectionsLibrary />}
              {activeTab === 'trash' && <TrashTab />}
              {activeTab === 'dream_board' && <DreamBoardTab />}
              {activeTab === 'landing_page' && <LandingPageTab />}
            </main>
          </div>
        )}
      </div>

      {showOverloadReliefModal && (
        <OverloadReliefModal />
      )}

      {/* FLOATING "+" RAPID LOGGING ACTION BUTTON */}
      <FloatingActionButton
        focoActive={focoActive}
        onClick={() => {
          setRapidType('task');
          setShowRapidLog(true);
        }}
      />

      {/* RAPID LOGGING MODAL */}
      {showRapidLog && (
        <RapidLogModal
          showRapidLog={showRapidLog}
          setShowRapidLog={setShowRapidLog}
          rapidType={rapidType}
          setRapidType={setRapidType}
          rapidInput={rapidText}
          setRapidInput={setRapidText}
          handleRapidInputChange={handleRapidInputChange}
          handleRapidInputKeyDown={handleRapidInputKeyDown}
          showAutocompleteRapid={showAutocompleteRapid}
          filteredCollections={filteredCollections}
          autocompleteIndexRapid={autocompleteIndexRapid}
          selectCollectionAutocompleteRapid={selectCollectionAutocompleteRapid}
          handleSaveRapidLog={handleSaveRapidLog}
          rapidIcon={rapidIcon}
          setRapidIcon={setRapidIcon}
          rapidDate={rapidDate}
          setRapidDate={setRapidDate}
          rapidTime={rapidTime}
          setRapidTime={setRapidTime}
        />
      )}

      {/* GLOBAL CUSTOM CONFIRMATION DIALOG */}
      <ConfirmationModal />

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal />
    </div>
  );
}

function AppContentWithAuth() {
  const { user, loading, offlineMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-zinc-950 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 border-4 border-bujo-highlight border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-555">Carregando BuJo Focus...</span>
        </div>
      </div>
    );
  }

  if (!user && !offlineMode) {
    return <AuthScreen />;
  }

  return <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <BujoProvider>
        <AppContentWithAuth />
      </BujoProvider>
    </AuthProvider>
  );
}

export default App;
