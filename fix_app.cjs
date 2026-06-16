const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import components
content = content.replace(
  "import { TutorialOverlay } from './components/common/TutorialOverlay';",
  "import { TutorialOverlay } from './components/common/TutorialOverlay';\nimport { FeatureHelpModal, FloatingHelpButton } from './components/common/FeatureHelpModal';"
);

// Destructure new states
content = content.replace(
  "const { focoActive, activeTab, items, showTutorial, setShowTutorial, setActiveTab, syncStatus, setDeferredPrompt, deferredPrompt } = useBujo();",
  "const { focoActive, activeTab, items, showTutorial, setShowTutorial, setActiveTab, syncStatus, setDeferredPrompt, deferredPrompt, viewedFeatureHelp, setViewedFeatureHelp, setShowFeatureHelpModal } = useBujo();"
);

// Add useEffect for auto-trigger
const useEffectCode = `
  // Auto-trigger Feature Help on first visit
  useEffect(() => {
    if (!activeTab || activeTab === 'landing_page') return;
    
    // Check if the current tab has been viewed
    if (!viewedFeatureHelp[activeTab]) {
      // Small delay to allow tab transition animation
      const timer = setTimeout(() => {
        setShowFeatureHelpModal(true);
        setViewedFeatureHelp(prev => ({ ...prev, [activeTab]: true }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, viewedFeatureHelp, setViewedFeatureHelp, setShowFeatureHelpModal]);
`;

content = content.replace(
  "// Handle global PWA event",
  useEffectCode + "\n\n  // Handle global PWA event"
);

// Render the components
content = content.replace(
  "      <TutorialOverlay showTutorial={showTutorial} onClose={() => setShowTutorial(false)} setActiveTab={setActiveTab} />",
  "      <TutorialOverlay showTutorial={showTutorial} onClose={() => setShowTutorial(false)} setActiveTab={setActiveTab} />\n      <FeatureHelpModal />\n      <FloatingHelpButton />"
);

fs.writeFileSync(path, content, 'utf8');