import { useBujo, BujoProvider } from './context/BujoContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './features/auth/components/AuthScreen';
import { Toast } from './components/common/Toast';
import { CozyCabinBackground } from './components/common/CozyCabinBackground';
import { TutorialOverlay } from './components/common/TutorialOverlay';
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
import { BrainDumpStation } from './features/braindump/components/BrainDumpStation';
import { SettingsTab } from './features/settings/components/SettingsTab';
import { CollectionsLibrary } from './features/collections/components/CollectionsLibrary';
import { FocusMode } from './features/focus/components/FocusMode';
import { AISuggestionsModal } from './features/planner/components/AISuggestionsModal';

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
    aiSuggestions,
    setAiSuggestions,
    customSteps,
    setCustomSteps,
    isOptimizingTask,
    items,
    setItems,
    breakingTaskIds,
    handleAIOptimizeTask,
    handleAISplitTask,
    handleToggleCustomStep,
    handleEditCustomStep,
    handleRemoveCustomStep,
    handleAddCustomStep,
    handleApplyAISuggestion,
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
    renderRealTimeSuggestions,
    createRapidTaskWithSuggestions,
    focoActive,
    expandedTaskId,
    setExpandedTaskId
  } = useBujo();

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
            <main id="bujo-export-area" className="flex-1 min-h-0 flex flex-col gap-6 overflow-y-auto pr-1">
              {activeTab === 'indice' && <IndexTab />}
              {activeTab === 'daily_log' && <DailyLogTab />}
              {activeTab === 'weekly_log' && <WeeklyLogTab />}
              {activeTab === 'monthly_log' && <MonthlyLogTab />}
              {activeTab === 'daily_spread' && <TimelineTab />}
              {activeTab === 'future_log' && <FutureLogTab />}
              {activeTab === 'brain_dump' && <BrainDumpStation />}
              {activeTab === 'settings' && <SettingsTab />}
              {activeTab === 'collections' && <CollectionsLibrary />}
            </main>
          </div>
        )}
      </div>

      {aiSuggestions && (
        <AISuggestionsModal
          taskContent={aiSuggestions.content}
          customSteps={customSteps}
          handleToggleCustomStep={handleToggleCustomStep}
          handleEditCustomStep={handleEditCustomStep}
          handleRemoveCustomStep={handleRemoveCustomStep}
          handleAddCustomStep={handleAddCustomStep}
          handleApplyAISuggestion={handleApplyAISuggestion}
          setAiSuggestions={setAiSuggestions}
          setCustomSteps={setCustomSteps}
          onUpdateTaskContent={(newContent) => {
            setItems((prev: any) => prev.map((item: any) => {
              if (item.id === aiSuggestions.taskId) {
                return { ...item, content: newContent };
              }
              return item;
            }));
            setAiSuggestions((prev: any) => prev ? { ...prev, content: newContent } : null);
          }}
          handleOptimizeDescription={() => {
            handleAIOptimizeTask(aiSuggestions.taskId, aiSuggestions.content);
          }}
          isOptimizing={isOptimizingTask}
          handleRegenerateSuggestions={(refinement, updatedTaskContent, stylePreset) => {
            const finalContent = updatedTaskContent || aiSuggestions.content || '';
            let finalRefinement = refinement || '';
            if (stylePreset && stylePreset !== 'default') {
              const presets: { [key: string]: string } = {
                baby_steps: 'passos extremamente curtos e fáceis (passos de bebê)',
                pomodoro: 'passos organizados com pomodoro e blocos de tempo',
                preparation: 'com foco forte em preparação do ambiente e remoção de distrações'
              };
              const presetText = presets[stylePreset] || stylePreset;
              finalRefinement = finalRefinement 
                ? `${finalRefinement}. Detalhe adicional: ${presetText}`
                : `Foco em: ${presetText}`;
            }
            setItems((prev: any) => prev.map((item: any) => {
              if (item.id === aiSuggestions.taskId) {
                return { ...item, content: finalContent };
              }
              return item;
            }));
            setAiSuggestions((prev: any) => prev ? { ...prev, content: finalContent } : null);

            handleAISplitTask(aiSuggestions.taskId, finalContent, finalRefinement);
          }}
          isGenerating={breakingTaskIds[aiSuggestions.taskId]}
        />
      )}

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
          renderRealTimeSuggestions={renderRealTimeSuggestions}
          createRapidTaskWithSuggestions={createRapidTaskWithSuggestions}
        />
      )}
    </div>
  );
}

function AppContentWithAuth() {
  const { user, loading } = useAuth();

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

  if (!user) {
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
