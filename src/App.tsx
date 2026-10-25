import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Board, ViewMode, BoardLayoutMode, TaskCard, UserSession, NotificationSettings } from './types';
import {
  getInitialBoards,
  saveBoards,
  getNotificationSettings,
  saveNotificationSettings,
} from './lib/storage';
import { useTheme } from './hooks/useTheme';
import { supabase } from './lib/supabase';
import { playAlertChime } from './lib/sound';

// Components
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { BoardView } from './components/BoardView';
import { CalendarView } from './components/CalendarView';
import { TimelineView } from './components/TimelineView';

// Modals
import { CardDetailModal } from './components/CardDetailModal';
import { SearchModal } from './components/SearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { BoardSettingsModal } from './components/BoardSettingsModal';
import { AuthModal } from './components/AuthModal';

// Safe fire-and-forget sync helper
async function syncToSupabase(operation: PromiseLike<unknown>) {
  try {
    await operation;
  } catch (err) {
    console.warn('Supabase sync notice:', err);
  }
}

export default function App() {
  const { themeMode, setThemeMode } = useTheme();

  // App State
  const [boards, setBoards] = useState<Board[]>(() => getInitialBoards());
  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    const initial = getInitialBoards();
    return initial[0]?.id || '';
  });
  const [activeView, setActiveView] = useState<ViewMode>('tablero');
  const [boardLayout, setBoardLayout] = useState<BoardLayoutMode>('horizontal');

  // Modals state
  const [selectedCard, setSelectedCard] = useState<TaskCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // User and notifications
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [notificationConfig, setNotificationConfig] = useState<NotificationSettings>(() =>
    getNotificationSettings()
  );

  // Save boards to local storage whenever they change
  useEffect(() => {
    saveBoards(boards);
  }, [boards]);

  // Save notification config
  useEffect(() => {
    saveNotificationSettings(notificationConfig);
  }, [notificationConfig]);

  // Initial Supabase session load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || 'usuario',
          });
          // Load boards from Supabase
          loadSupabaseBoards(session.user.id);
        }
      } catch (err) {
        console.warn('Supabase session check error:', err);
      }
    };
    checkSession();
  }, []);

  const loadSupabaseBoards = async (userId: string) => {
    try {
      const { data: bData, error: bErr } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (bErr || !bData || bData.length === 0) return;

      const loadedBoards: Board[] = [];

      for (const b of bData) {
        const { data: cData } = await supabase
          .from('columns')
          .select('*')
          .eq('board_id', b.id)
          .order('position', { ascending: true });

        const columns = [];
        for (const c of cData || []) {
          const { data: kData } = await supabase
            .from('cards')
            .select('*')
            .eq('column_id', c.id)
            .order('position', { ascending: true });

          const cards: TaskCard[] = (kData || []).map((k) => ({
            id: k.id,
            columnId: c.id,
            text: k.text,
            description: k.description || '',
            dueDate: k.due_date ? k.due_date.split('T')[0] : '',
            dueTime:
              k.due_date && k.due_date.includes('T')
                ? k.due_date.split('T')[1].substring(0, 5)
                : '',
            completed: k.completed || false,
            colorTag: 'indigo',
            labels: k.labels || [],
            checklist: k.checklist || [],
            position: k.position || 0,
          }));

          columns.push({
            id: c.id,
            boardId: b.id,
            name: c.name,
            position: c.position,
            color: c.color || '#6366f1',
            cards,
          });
        }

        loadedBoards.push({
          id: b.id,
          name: b.name,
          description: b.description || '',
          backgroundColor: b.background_color || '#0f172a',
          columns,
        });
      }

      if (loadedBoards.length > 0) {
        setBoards(loadedBoards);
        setActiveBoardId(loadedBoards[0].id);
      }
    } catch (err) {
      console.warn('Error loading Supabase boards:', err);
    }
  };

  // Keyboard shortcut: Ctrl+K or Cmd+K to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active Board
  const activeBoard = useMemo(() => {
    return boards.find((b) => b.id === activeBoardId) || boards[0] || null;
  }, [boards, activeBoardId]);

  // Overall Task Count & Alert Badge calculation
  const { totalCards, completedCards, alertCount } = useMemo(() => {
    let total = 0;
    let completed = 0;
    let alerts = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    boards.forEach((b) => {
      b.columns.forEach((col) => {
        col.cards.forEach((card) => {
          total++;
          if (card.completed) completed++;
          if (card.dueDate && !card.completed) {
            if (card.dueDate <= todayStr) {
              alerts++;
            }
          }
        });
      });
    });

    return { totalCards: total, completedCards: completed, alertCount: alerts };
  }, [boards]);

  // Periodic deadline alarm checker (every 60s)
  useEffect(() => {
    const checkDeadlines = () => {
      if (!notificationConfig.enabled) return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      boards.forEach((b) => {
        b.columns.forEach((col) => {
          col.cards.forEach((card) => {
            if (card.dueDate && !card.completed) {
              const key = `${card.id}-${card.dueDate}`;
              const alreadyNotified = notificationConfig.notifiedIds?.[key];

              if (!alreadyNotified) {
                if (card.dueDate < todayStr || (card.dueDate === todayStr && (!card.dueTime || card.dueTime <= currentTime))) {
                  // Trigger alert
                  if (notificationConfig.sound) playAlertChime();
                  if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                      new Notification('⚠️ Alerta de Tarea - TaskForge', {
                        body: `"${card.text}" vence hoy (${card.dueTime || 'Hoy'})`,
                        icon: '/icon.svg',
                      });
                    } catch {
                      // ignore
                    }
                  }

                  setNotificationConfig((prev) => ({
                    ...prev,
                    notifiedIds: { ...prev.notifiedIds, [key]: true },
                  }));
                }
              }
            }
          });
        });
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000);
    return () => clearInterval(interval);
  }, [boards, notificationConfig]);

  // --- Board Column & Card Operations ---

  const handleAddColumn = (name: string) => {
    if (!activeBoard) return;
    const newColId = 'col-' + Date.now();
    const newColumn = {
      id: newColId,
      boardId: activeBoard.id,
      name,
      position: activeBoard.columns.length,
      color: '#6366f1',
      cards: [],
    };

    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id ? { ...b, columns: [...b.columns, newColumn] } : b
      )
    );

    // Sync to Supabase if connected
    if (currentUser) {
      syncToSupabase(
        supabase.from('columns').insert({
          board_id: activeBoard.id,
          name,
          position: activeBoard.columns.length,
          color: '#6366f1',
        })
      );
    }
  };


  const handleEditColumn = (columnId: string, name: string) => {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              columns: b.columns.map((col) =>
                col.id === columnId ? { ...col, name } : col
              ),
            }
          : b
      )
    );

    if (currentUser) {
      syncToSupabase(supabase.from('columns').update({ name }).eq('id', columnId));
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!activeBoard) return;
    if (
      !confirm(
        '¿Eliminar esta columna y todas sus tareas asociadas?'
      )
    )
      return;

    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id
          ? { ...b, columns: b.columns.filter((c) => c.id !== columnId) }
          : b
      )
    );

    if (currentUser) {
      syncToSupabase(supabase.from('columns').delete().eq('id', columnId));
    }
  };

  const handleAddCard = (columnId: string, text: string) => {
    if (!activeBoard) return;
    const newCard: TaskCard = {
      id: 'card-' + Date.now(),
      columnId,
      text,
      description: '',
      dueDate: '',
      dueTime: '',
      completed: false,
      colorTag: 'indigo',
      labels: [],
      checklist: [],
      position: 0,
    };

    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              columns: b.columns.map((col) =>
                col.id === columnId
                  ? { ...col, cards: [...col.cards, newCard] }
                  : col
              ),
            }
          : b
      )
    );

    if (currentUser) {
      syncToSupabase(
        supabase.from('cards').insert({
          column_id: columnId,
          text,
          position: 0,
        })
      );
    }
  };

  const handleSaveCard = (updatedCard: TaskCard) => {
    if (!activeBoard) return;

    setBoards((prev) =>
      prev.map((b) => {
        // If column didn't change:
        let found = false;
        const newCols = b.columns.map((col) => {
          const cardExists = col.cards.some((c) => c.id === updatedCard.id);
          if (cardExists) {
            found = true;
            if (col.id === updatedCard.columnId) {
              return {
                ...col,
                cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
              };
            } else {
              // moved to another column
              return {
                ...col,
                cards: col.cards.filter((c) => c.id !== updatedCard.id),
              };
            }
          } else if (col.id === updatedCard.columnId && !found) {
            return {
              ...col,
              cards: [...col.cards, updatedCard],
            };
          }
          return col;
        });

        // If card was moved to another column in the same board
        if (newCols.some((col) => col.id === updatedCard.columnId)) {
          const targetCol = newCols.find((col) => col.id === updatedCard.columnId);
          if (targetCol && !targetCol.cards.some((c) => c.id === updatedCard.id)) {
            targetCol.cards.push(updatedCard);
          }
        }

        return { ...b, columns: newCols };
      })
    );

    if (currentUser) {
      const dueDate = updatedCard.dueDate
        ? updatedCard.dueDate + (updatedCard.dueTime ? `T${updatedCard.dueTime}:00` : 'T09:00:00')
        : null;

      syncToSupabase(
        supabase
          .from('cards')
          .update({
            column_id: updatedCard.columnId,
            text: updatedCard.text,
            description: updatedCard.description,
            completed: updatedCard.completed,
            due_date: dueDate,
            labels: updatedCard.labels,
            checklist: updatedCard.checklist,
          })
          .eq('id', updatedCard.id)
      );
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setBoards((prev) =>
      prev.map((b) => ({
        ...b,
        columns: b.columns.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== cardId),
        })),
      }))
    );

    if (currentUser) {
      syncToSupabase(supabase.from('cards').delete().eq('id', cardId));
    }
  };

  const handleToggleComplete = (cardId: string) => {
    setBoards((prev) =>
      prev.map((b) => ({
        ...b,
        columns: b.columns.map((col) => ({
          ...col,
          cards: col.cards.map((card) =>
            card.id === cardId ? { ...card, completed: !card.completed } : card
          ),
        })),
      }))
    );

    if (currentUser) {
      // Find card to toggle
      let currentVal = false;
      boards.forEach((b) =>
        b.columns.forEach((c) =>
          c.cards.forEach((k) => {
            if (k.id === cardId) currentVal = k.completed;
          })
        )
      );
      syncToSupabase(
        supabase.from('cards').update({ completed: !currentVal }).eq('id', cardId)
      );
    }
  };

  // Crucial Accessible Column Move Handler (called both from Drag&Drop and Accessible Dropdown)
  const handleMoveCard = (cardId: string, targetColId: string) => {
    setBoards((prev) =>
      prev.map((b) => {
        let cardToMove: TaskCard | null = null;

        // Extract card
        const columnsWithoutCard = b.columns.map((col) => {
          const match = col.cards.find((c) => c.id === cardId);
          if (match) cardToMove = { ...match, columnId: targetColId };
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
          };
        });

        if (!cardToMove) return b;

        // Add to target column
        return {
          ...b,
          columns: columnsWithoutCard.map((col) => {
            if (col.id === targetColId) {
              return {
                ...col,
                cards: [...col.cards, cardToMove!],
              };
            }
            return col;
          }),
        };
      })
    );

    if (currentUser) {
      syncToSupabase(
        supabase.from('cards').update({ column_id: targetColId }).eq('id', cardId)
      );
    }
  };

  // --- Board Operations ---

  const handleNewBoard = () => {
    const name = prompt('Nombre del nuevo tablero:');
    if (!name || !name.trim()) return;

    const newBoardId = 'board-' + Date.now();
    const newBoard: Board = {
      id: newBoardId,
      name: name.trim(),
      description: '',
      backgroundColor: '#0f172a',
      accentColor: '#6366f1',
      columns: [
        { id: 'col-' + Date.now() + '-1', boardId: newBoardId, name: 'Por Hacer', position: 0, color: '#6366f1', cards: [] },
        { id: 'col-' + Date.now() + '-2', boardId: newBoardId, name: 'En Proceso', position: 1, color: '#f59e0b', cards: [] },
        { id: 'col-' + Date.now() + '-3', boardId: newBoardId, name: 'Hecho', position: 2, color: '#10b981', cards: [] },
      ],
    };

    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoardId);

    if (currentUser) {
      (async () => {
        try {
          const { data: b } = await supabase
            .from('boards')
            .insert({
              user_id: currentUser.id,
              name: name.trim(),
              background_color: 'azul-marino',
            })
            .select()
            .single();

          if (b && typeof b === 'object' && 'id' in b) {
            const defaultCols = ['Por Hacer', 'En Proceso', 'Hecho'];
            for (let i = 0; i < defaultCols.length; i++) {
              await supabase.from('columns').insert({
                board_id: (b as { id: string }).id,
                name: defaultCols[i],
                position: i,
                color: 'negro',
              });
            }
          }
        } catch (e) {
          console.warn('Error creating board in Supabase:', e);
        }
      })();
    }
  };

  const handleSaveBoard = (boardId: string, name: string, description: string, color: string) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? { ...b, name, description, backgroundColor: color }
          : b
      )
    );

    if (currentUser) {
      syncToSupabase(
        supabase.from('boards').update({ name, description }).eq('id', boardId)
      );
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    const remaining = boards.filter((b) => b.id !== boardId);
    if (remaining.length === 0) {
      alert('Debes mantener al menos un tablero activo.');
      return;
    }
    setBoards(remaining);
    setActiveBoardId(remaining[0].id);

    if (currentUser) {
      syncToSupabase(supabase.from('boards').delete().eq('id', boardId));
    }
  };


  const handleCardClick = (card: TaskCard) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  const handleSearchResultClick = (boardId: string, card: TaskCard) => {
    setActiveBoardId(boardId);
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* App Header */}
      {/* App Header with brand, version, notifications, theme and user */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        alertCount={alertCount}
        themeMode={themeMode}
        onSelectThemeMode={setThemeMode}
        currentUser={currentUser}
      />

      {/* Screen Navigation Segmented Bar (Tablero, Calendario, Cronograma) + Search & Gear next to Column toggle */}
      <NavigationTabs
        activeView={activeView}
        onViewChange={(v) => setActiveView(v)}
        boardLayout={boardLayout}
        onToggleBoardLayout={() =>
          setBoardLayout((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
        }
        totalCards={totalCards}
        completedCards={completedCards}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBoardSettings={() => setIsBoardSettingsOpen(true)}
        activeBoardName={activeBoard?.name || 'Tableros'}
      />

      {/* Active Screen View */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeBoard ? (
          <>
            {activeView === 'tablero' && (
              <BoardView
                board={activeBoard}
                layoutMode={boardLayout}
                onAddColumn={handleAddColumn}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
                onAddCard={handleAddCard}
                onCardClick={handleCardClick}
                onToggleComplete={handleToggleComplete}
                onMoveCard={handleMoveCard}
                onDeleteCard={handleDeleteCard}
              />
            )}

            {activeView === 'calendario' && (
              <CalendarView board={activeBoard} onCardClick={handleCardClick} />
            )}

            {activeView === 'cronograma' && (
              <TimelineView
                board={activeBoard}
                onCardClick={handleCardClick}
                onToggleComplete={handleToggleComplete}
                onMoveCard={handleMoveCard}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400">
            No hay tableros activos. Haz clic en el engranaje para crear uno.
          </div>
        )}
      </main>

      {/* MODALS */}
      <CardDetailModal
        card={selectedCard}
        columns={activeBoard?.columns || []}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        boards={boards}
        onSelectResult={handleSearchResultClick}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        settings={notificationConfig}
        onSaveSettings={setNotificationConfig}
        boards={boards}
        onCardClick={(boardId, card) => {
          setActiveBoardId(boardId);
          setSelectedCard(card);
          setIsDetailOpen(true);
        }}
      />

      {activeBoard && (
        <BoardSettingsModal
          isOpen={isBoardSettingsOpen}
          onClose={() => setIsBoardSettingsOpen(false)}
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={(id) => setActiveBoardId(id)}
          onNewBoard={handleNewBoard}
          board={activeBoard}
          onSaveBoard={handleSaveBoard}
          onDeleteBoard={handleDeleteBoard}
          canDelete={boards.length > 1}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          if (user) loadSupabaseBoards(user.id);
        }}
      />

    </div>
  );
}
