import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { save, open } from '@tauri-apps/api/dialog';

interface ExportResult {
  success: boolean;
  path: string | null;
  error: string | null;
}

function App() {
  const [view, setView] = useState<'home' | 'editor'>('home');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#FDFBF7',
      fontFamily: "'Inter', sans-serif",
    }}>
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid #F5EBD8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #EDE9FE, #DBEAFE)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#8B5CF6',
          }}>
            C
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
              Carousify
            </h1>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Desktop Edition
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setView('home')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: view === 'home' ? '#EDE9FE' : 'transparent',
              color: view === 'home' ? '#8B5CF6' : '#6b7280',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Templates
          </button>
          <button
            onClick={() => setView('editor')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: view === 'editor' ? '#EDE9FE' : 'transparent',
              color: view === 'editor' ? '#8B5CF6' : '#6b7280',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Editor
          </button>
        </div>
      </header>
      
      <main style={{ padding: '32px', height: 'calc(100vh - 80px)', overflow: 'auto' }}>
        {view === 'home' ? (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a2e' }}>
              Welcome to Carousify
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>
              Create stunning Instagram carousel posts
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {['3 Panel Grid', '6 Panel Grid', 'Asymmetrical', 'Split Layout'].map((name, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setView('editor')}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{
                    aspectRatio: '9/16',
                    background: `linear-gradient(135deg, ${
                      i % 4 === 0 ? '#EDE9FE' : i % 4 === 1 ? '#DBEAFE' : i % 4 === 2 ? '#FCE7F3' : '#F5EBD8'
                    } 0%, white 100%)`,
                    borderRadius: '16px',
                    marginBottom: '16px',
                  }} />
                  <h3 style={{ fontWeight: 600, color: '#1a1a2e' }}>{name}</h3>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1a1a2e' }}>
              Canvas Editor
            </h2>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{ color: '#6b7280' }}>
                Editor workspace - use the web version for full editing capabilities
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
