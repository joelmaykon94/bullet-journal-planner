const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filepath, 'utf8');

// The goal is to replace the JSX elements with their component equivalents.
// Since it's a huge file, we'll try to find specific markers and replace the blocks between them.

// We need to pass the appropriate props to each component. This script will try to be as precise as possible.

content = content.replace(/<header className="relative z-20[\s\S]*?<\/header>/, `
      <Header
        focoActive={focoActive}
        setFocoActive={setFocoActive}
        setActiveTab={setActiveTab}
        aiEngine={aiEngine}
        chromeAIDetected={chromeAIDetected}
        chromeAIStatus={chromeAIStatus}
        localLLMState={localLLMState}
        setPomodoroRunning={setPomodoroRunning}
        triggerPWAInstall={triggerPWAInstall}
      />
`);

content = content.replace(/\{focoActive \? \([\s\S]*?\) : \(/, `{focoActive ? (
          <FocusMode
            pomodoroTime={pomodoroTime}
            pomodoroRunning={pomodoroRunning}
            pomodoroMode={pomodoroMode}
            setPomodoroRunning={setPomodoroRunning}
            setPomodoroTime={setPomodoroTime}
            items={items}
            cycleStatus={cycleStatus}
            toggleSubtask={toggleSubtask}
            currentMaxQuote={currentMaxQuote}
            handleAskMaxForQuote={handleAskMaxForQuote}
          />
        ) : (`);

content = content.replace(/<aside className="hidden md:flex md:flex-col[\s\S]*?<\/aside>/, `
            <Sidebar
              userXp={userXp}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
`);

content = content.replace(/\{activeTab === 'indice' && \([\s\S]*?\{activeTab === 'daily_log' && \(/, `{activeTab === 'indice' && (
                <IndexTab
                  userXp={userXp}
                  setActiveTab={setActiveTab}
                  setShowTutorial={setShowTutorial}
                  items={items}
                  completedPomodoros={completedPomodoros}
                  getCognitiveLoad={getCognitiveLoad}
                  getHarmonyScore={getHarmonyScore}
                  getHarmonyRecommendation={getHarmonyRecommendation}
                  showEnergyGuide={showEnergyGuide}
                  setShowEnergyGuide={setShowEnergyGuide}
                />
              )}
              {activeTab === 'daily_log' && (`);

content = content.replace(/\{activeTab === 'daily_log' && \([\s\S]*?\{activeTab === 'daily_spread' && \(/, `{activeTab === 'daily_log' && (
                <DailyLogTab
                  items={items}
                  exportToPDF={exportToPDF}
                  handlePrint={handlePrint}
                  handleSaveStandardInput={handleSaveStandardInput}
                  standardType={standardType}
                  setStandardType={setStandardType}
                  standardInput={standardInput}
                  handleStandardInputChange={handleStandardInputChange}
                  handleStandardInputKeyDown={handleStandardInputKeyDown}
                  showAutocomplete={showAutocomplete}
                  filteredCollections={filteredCollections}
                  autocompleteIndex={autocompleteIndex}
                  selectCollectionAutocomplete={selectCollectionAutocomplete}
                  renderRealTimeSuggestions={renderRealTimeSuggestions}
                  createStandardTaskWithSuggestions={createStandardTaskWithSuggestions}
                  cycleStatus={cycleStatus}
                  editingItemId={editingItemId}
                  editingItemContent={editingItemContent}
                  setEditingItemContent={setEditingItemContent}
                  handleSaveEditItem={handleSaveEditItem}
                  setEditingItemId={setEditingItemId}
                  handleStartEditItem={handleStartEditItem}
                  handleDeleteItem={handleDeleteItem}
                  handleAISplitTask={handleAISplitTask}
                  breakingTaskIds={breakingTaskIds}
                  expandedTaskId={expandedTaskId}
                  setExpandedTaskId={setExpandedTaskId}
                  toggleSubtask={toggleSubtask}
                  deleteSubtask={deleteSubtask}
                  newSubtaskText={newSubtaskText}
                  setNewSubtaskText={setNewSubtaskText}
                  addSubtask={addSubtask}
                  getSubtaskCompletionString={getSubtaskCompletionString}
                />
              )}
              {activeTab === 'daily_spread' && (`);

content = content.replace(/\{activeTab === 'daily_spread' && \([\s\S]*?\{activeTab === 'future_log' && \(/, `{activeTab === 'daily_spread' && (
                <TimelineTab
                  items={items}
                  timelineMobileView={timelineMobileView}
                  setTimelineMobileView={setTimelineMobileView}
                  hours={hours}
                  assignItemToTime={assignItemToTime}
                  setSelectedHourToSchedule={setSelectedHourToSchedule}
                  editingItemId={editingItemId}
                  editingItemContent={editingItemContent}
                  setEditingItemContent={setEditingItemContent}
                  handleSaveEditItem={handleSaveEditItem}
                  setEditingItemId={setEditingItemId}
                  openTasksUnscheduled={openTasksUnscheduled}
                />
              )}
              {activeTab === 'future_log' && (`);

content = content.replace(/\{activeTab === 'future_log' && \([\s\S]*?\{activeTab === 'brain_dump' && \(/, `{activeTab === 'future_log' && (
                <FutureLogTab
                  items={items}
                  months={months}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  editingItemId={editingItemId}
                  editingItemContent={editingItemContent}
                  setEditingItemContent={setEditingItemContent}
                  handleSaveEditItem={handleSaveEditItem}
                  setEditingItemId={setEditingItemId}
                  handleStartEditItem={handleStartEditItem}
                  handleDeleteItem={handleDeleteItem}
                  handleAddFutureEvent={handleAddFutureEvent}
                  futureLogEventContent={futureLogEventContent}
                  setFutureLogEventContent={setFutureLogEventContent}
                />
              )}
              {activeTab === 'brain_dump' && (`);

content = content.replace(/\{activeTab === 'brain_dump' && \([\s\S]*?\{activeTab === 'settings' && \(/, `{activeTab === 'brain_dump' && (
                <BrainDumpStation
                  brainDumpText={brainDumpText}
                  setBrainDumpText={setBrainDumpText}
                  isProcessingBrainDump={isProcessingBrainDump}
                  adhdTriggers={adhdTriggers}
                  appendBrainDumpTrigger={appendBrainDumpTrigger}
                  handleBrainDumpOrganize={handleBrainDumpOrganize}
                  brainDumpResult={brainDumpResult}
                  addBrainDumpItemsToBujo={addBrainDumpItemsToBujo}
                />
              )}
              {activeTab === 'settings' && (`);

content = content.replace(/\{activeTab === 'settings' && \([\s\S]*?\{activeTab === 'collections' && \(/, `{activeTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  setSettings={setSettings}
                  setShowTutorial={setShowTutorial}
                  aiEngine={aiEngine}
                  setAiEngine={setAiEngine}
                  chromeAIDetected={chromeAIDetected}
                  chromeAIStatus={chromeAIStatus}
                  checkChromeAI={checkChromeAI}
                  isDownloading={isDownloading}
                  downloadProgress={downloadProgress}
                  downloadStatusText={downloadStatusText}
                  handleTestChromeAI={handleTestChromeAI}
                  isTestingAI={isTestingAI}
                  testOutput={testOutput}
                  localLLMState={localLLMState}
                  localLLMProgress={localLLMProgress}
                  localLLMError={localLLMError}
                  initLocalLLMWorker={initLocalLLMWorker}
                  handleForceDownloadChromeAI={handleForceDownloadChromeAI}
                />
              )}
              {activeTab === 'collections' && (`);

// Collections Library is already replaced properly in previous step, so we don't need to do it again if it works.

content = content.replace(/\{\/\* FLOATING "\+" RAPID LOGGING ACTION BUTTON \*\/\}[\s\S]*?\{\/\* RAPID LOGGING MODAL \*\/\}/, `
      {/* FLOATING "+" RAPID LOGGING ACTION BUTTON */}
      <FloatingActionButton
        focoActive={focoActive}
        onClick={() => {
          setRapidType('task');
          setShowRapidLog(true);
        }}
      />

      {/* RAPID LOGGING MODAL */}
`);

content = content.replace(/\{showRapidLog && \([\s\S]*?\{\/\* Body Double \/ Audio Companion Widget \*\/\}/, `{showRapidLog && (
        <RapidLogModal
          showRapidLog={showRapidLog}
          setShowRapidLog={setShowRapidLog}
          rapidType={rapidType}
          setRapidType={setRapidType}
          rapidInput={rapidInput}
          setRapidInput={setRapidInput}
          handleRapidInputChange={handleRapidInputChange}
          handleRapidInputKeyDown={handleRapidInputKeyDown}
          showAutocompleteRapid={showAutocompleteRapid}
          filteredCollections={filteredCollections}
          autocompleteIndexRapid={autocompleteIndexRapid}
          selectCollectionAutocompleteRapid={selectCollectionAutocompleteRapid}
          handleSaveRapidLog={handleSaveRapidLog}
          renderRealTimeSuggestions={renderRealTimeSuggestions}
          createRapidTaskWithSuggestions={createStandardTaskWithSuggestions}
        />
      )}

      {/* Body Double / Audio Companion Widget */}`);

content = content.replace(/<div className="fixed bottom-6 right-6 z-40 no-print">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*export default App;/g, `
      <FocusPartnerControls
        isEditingPartner={isEditingPartner}
        partnerName={partnerName}
        setPartnerName={setPartnerName}
        partnerEmoji={partnerEmoji}
        setPartnerEmoji={setPartnerEmoji}
        setIsEditingPartner={setIsEditingPartner}
        soundType={soundType}
        setSoundType={setSoundType}
        toggleAmbientAudio={toggleAmbientAudio}
        ambientPlaying={ambientPlaying}
        ambientVolume={ambientVolume}
        setAmbientVolume={setAmbientVolume}
      />
    </div>
  );
}

export default App;
`);


content = content.replace(/\{aiSuggestions && \([\s\S]*?\{\/\* Cancel Button footer \*\/\}/, `{aiSuggestions && (
        <AISuggestionsModal
          customSteps={customSteps}
          handleToggleCustomStep={handleToggleCustomStep}
          handleEditCustomStep={handleEditCustomStep}
          handleRemoveCustomStep={handleRemoveCustomStep}
          handleAddCustomStep={handleAddCustomStep}
          handleApplyAISuggestion={handleApplyAISuggestion}
          setAiSuggestions={setAiSuggestions}
          setCustomSteps={setCustomSteps}
        />
      )}`);

// Clean up left over of AI suggestions modal
content = content.replace(/<div className="flex items-center justify-end border-t border-zinc-200\/50 dark:border-white\/10 pt-4 mt-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/, '');


fs.writeFileSync(filepath, content, 'utf8');
console.log('Done refactoring');
