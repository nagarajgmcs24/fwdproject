import { useState } from 'react';
import { AlertCircle, FileText, Home } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { WardSelector } from './components/WardSelector';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintsList } from './components/ComplaintsList';

type View = 'home' | 'report' | 'view';

function AppContent() {
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [refreshCount, setRefreshCount] = useState(0);
  const { t } = useLanguage();

  const handleComplaintSuccess = () => {
    setRefreshCount(prev => prev + 1);
    setTimeout(() => {
      setCurrentView('view');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {t.appName}
                </h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <WardSelector
                selectedWardId={selectedWardId}
                onSelectWard={setSelectedWardId}
              />
            </div>

            {selectedWardId ? (
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setCurrentView('report')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                  <h2 className="text-xl font-bold">{t.reportProblem}</h2>
                </button>
                <button
                  onClick={() => setCurrentView('view')}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <FileText className="w-12 h-12 mx-auto mb-3" />
                  <h2 className="text-xl font-bold">{t.viewComplaints}</h2>
                </button>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                <p className="font-medium">{t.selectWardFirst}</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'report' && selectedWardId && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              ← {t.back}
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.reportProblem}</h2>
            <ComplaintForm wardId={selectedWardId} onSuccess={handleComplaintSuccess} />
          </div>
        )}

        {currentView === 'view' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              ← {t.back}
            </button>
            <ComplaintsList wardId={selectedWardId} refresh={refreshCount} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>{t.appName} - {t.subtitle}</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
