const fs = require('fs');

const path = 'src/context/BujoContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const exportTypeLine = 'export interface BujoContextType {';
const newStatesType = `  showFeatureHelpModal: boolean;\n  setShowFeatureHelpModal: React.Dispatch<React.SetStateAction<boolean>>;\n  viewedFeatureHelp: Record<string, boolean>;\n  setViewedFeatureHelp: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;\n`;

content = content.replace(exportTypeLine, exportTypeLine + '\n' + newStatesType);

const statesImpl = `
  const [showFeatureHelpModal, setShowFeatureHelpModal] = useState(false);
  const [viewedFeatureHelp, setViewedFeatureHelp] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('bujo_feature_help_viewed');
    if (saved) return JSON.parse(saved);
    return {};
  });

  useEffect(() => {
    localStorage.setItem('bujo_feature_help_viewed', JSON.stringify(viewedFeatureHelp));
  }, [viewedFeatureHelp]);
`;

// Insert the state implementation inside BujoProvider
const providerStart = 'export function BujoProvider({ children }: { children: ReactNode }) {';
content = content.replace(providerStart, providerStart + '\n' + statesImpl);

// Export them in the provider value
const providerValueReturn = '<BujoContext.Provider value={{';
const newValues = `\n      showFeatureHelpModal,\n      setShowFeatureHelpModal,\n      viewedFeatureHelp,\n      setViewedFeatureHelp,\n`;
content = content.replace(providerValueReturn, providerValueReturn + newValues);

fs.writeFileSync(path, content, 'utf8');
