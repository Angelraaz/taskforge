import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Board,
  ViewMode,
  BoardLayoutMode,
  TaskCard,
  BoardColumn,
  UserSession,
  NotificationSettings,
  BoardMember,
} from './types';
import {
  getInitialBoards,
  saveBoards,
  getNotificationSettings,
  saveNotificationSettings,
} from './lib/storage';
import { useTheme } from './hooks/useTheme';
import { playAlertChime } from './lib/sound';
import { getLocalDateString, getLocalTimeString } from './lib/dateUtils';
import { supabase } from './lib/supabase';
import {
  fetchAuthoritativeBoards,
  cacheBoardsLocally,
  createBoardInSupabase,
  updateBoardInSupabase,
  deleteBoardInSupabase,
  createColumnInSupabase,
  updateColumnInSupabase,
  deleteColumnInSupabase,
  createCardInSupabase,
  updateCardInSupabase,
  toggleCardCompleteInSupabase,
  moveCardColumnInSupabase,
  deleteCardInSupabase,
} from './lib/supabaseService';

// Components
import { Header, SyncStatus } from './components/Header';
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
import { WorkgroupModal } from './components/WorkgroupModal';
import { Hammer, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const { themeMode, setThemeMode } = useTheme();

  // Loading and authoritative sync states
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [syncError, setSyncError] = useState<string | null>(null);

  // App State: populated strictly from authoritative source
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [activeView, setActiveView] = useState<ViewMode>('tablero');
  const [boardLayout, setBoardLayout] = useState<BoardLayoutMode>('horizontal');

  // Modals state
  const [selectedCard, setSelectedCard] = useState<TaskCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWorkgroupOpen, setIsWorkgroupOpen] = useState(false);

  // Notifications
  const [notificationConfig, setNotificationConfig] = useState<NotificationSettings>(() =>
    getNotificationSettings()
  );

  // Save notification preferences
  useEffect(() => {
    saveNotificationSettings(notificationConfig);
  }, [notificationConfig]);

  /**
   * 1. SINGLE SOURCE OF TRUTH: Fetch fresh authoritative data from Supabase.
   * LocalStorage is NEVER allowed to overwrite fresh cloud data.
   */
  const loadAuthoritativeData = useCallback(async (userId: string) => {
    setSyncStatus('saving');
    setSyncError(null);
    try {
      const freshBoards = await fetchAuthoritativeBoards(userId);
      setBoards(freshBoards);
      if (freshBoards.length > 0) {
        setActiveBoardId((prev) => {
          const exists = freshBoards.some((b) => b.id === prev);
          return exists ? prev : freshBoards[0].id;
        });
      }
      setSyncStatus('synced');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con Supabase';
      console.error('Error al cargar tableros autoritativos de Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
    }
  }, []);

  /**
   * Initialize Session & Supabase Auth Listener on Mount
   */
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const user: UserSession = {
            id: session.user.id,
            email: session.user.email || 'usuario@supabase.co',
          };
          setCurrentUser(user);
          await loadAuthoritativeData(user.id);
        } else {
          // Guest mode: load local guest state only when unauthenticated
          setCurrentUser(null);
          const localInitial = getInitialBoards();
          setBoards(localInitial);
          setActiveBoardId(localInitial[0]?.id || '');
          setSyncStatus('offline');
        }
      } catch (err: unknown) {
        console.error('Error inicializando sesión:', err);
        if (mounted) {
          const localInitial = getInitialBoards();
          setBoards(localInitial);
          setActiveBoardId(localInitial[0]?.id || '');
          setSyncStatus('offline');
        }
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    }

    initSession();

    // Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const user: UserSession = {
          id: session.user.id,
          email: session.user.email || 'usuario@supabase.co',
        };
        setCurrentUser(user);
        setIsLoadingAuth(true);
        await loadAuthoritativeData(user.id);
        setIsLoadingAuth(false);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        const guestBoards = getInitialBoards();
        setBoards(guestBoards);
        setActiveBoardId(guestBoards[0]?.id || '');
        setSyncStatus('offline');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadAuthoritativeData]);

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
    const todayStr = getLocalDateString();

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
      const todayStr = getLocalDateString(now);
      const currentTime = getLocalTimeString(now);

      boards.forEach((b) => {
        b.columns.forEach((col) => {
          col.cards.forEach((card) => {
            if (card.dueDate && !card.completed) {
              const key = `${card.id}-${card.dueDate}`;
              const alreadyNotified = notificationConfig.notifiedIds?.[key];

              if (!alreadyNotified) {
                if (
                  card.dueDate < todayStr ||
                  (card.dueDate === todayStr && (!card.dueTime || card.dueTime <= currentTime))
                ) {
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

  // =====================================================================
  // 3. ROBUST ASYNC MUTATION FUNCTIONS: Supabase First -> Confirm -> Local
  // =====================================================================

  const handleAddColumn = async (name: string) => {
    if (!activeBoard) return;
    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // Send first to Supabase
        const newCol = await createColumnInSupabase(
          activeBoard.id,
          name,
          activeBoard.columns.length
        );

        // Update local state strictly upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id ? { ...b, columns: [...b.columns, newCol] } : b
          );
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        // Guest mode fallback
        const guestCol: BoardColumn = {
          id: 'col-' + Date.now(),
          boardId: activeBoard.id,
          name: name.trim(),
          position: activeBoard.columns.length,
          color: '#6366f1',
          cards: [],
        };
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id ? { ...b, columns: [...b.columns, guestCol] } : b
          );
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear columna en Supabase';
      console.error('Error al crear columna en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo guardar la columna en Supabase: ${msg}`);
    }
  };

  const handleEditColumn = async (columnId: string, name: string) => {
    if (!activeBoard) return;
    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // Send first to Supabase
        await updateColumnInSupabase(columnId, { name });

        // Update local state upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? {
                  ...b,
                  columns: b.columns.map((col) =>
                    col.id === columnId ? { ...col, name } : col
                  ),
                }
              : b
          );
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? {
                  ...b,
                  columns: b.columns.map((col) =>
                    col.id === columnId ? { ...col, name } : col
                  ),
                }
              : b
          );
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar columna en Supabase';
      console.error('Error al actualizar columna en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo actualizar la columna en Supabase: ${msg}`);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!activeBoard) return;
    if (!confirm('¿Eliminar esta columna y todas sus tareas asociadas?')) return;

    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // Send first to Supabase
        await deleteColumnInSupabase(columnId);

        // Update local state upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? { ...b, columns: b.columns.filter((c) => c.id !== columnId) }
              : b
          );
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? { ...b, columns: b.columns.filter((c) => c.id !== columnId) }
              : b
          );
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar columna en Supabase';
      console.error('Error al eliminar columna en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo eliminar la columna en Supabase: ${msg}`);
    }
  };

  const handleMoveColumn = async (columnId: string, direction: 'left' | 'right') => {
    if (!activeBoard) return;
    const cols = [...activeBoard.columns];
    const currentIndex = cols.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cols.length) return;

    // Swap columns
    const temp = cols[currentIndex];
    cols[currentIndex] = cols[targetIndex];
    cols[targetIndex] = temp;

    // Recalculate position
    const reorderedCols = cols.map((col, idx) => ({ ...col, position: idx }));

    setBoards((prev) => {
      const updated = prev.map((b) =>
        b.id === activeBoard.id ? { ...b, columns: reorderedCols } : b
      );
      if (currentUser) cacheBoardsLocally(currentUser.id, updated);
      else saveBoards(updated);
      return updated;
    });

    if (currentUser) {
      try {
        for (const col of reorderedCols) {
          await updateColumnInSupabase(col.id, { name: col.name, position: col.position });
        }
      } catch (err) {
        console.warn('Error updating column order in Supabase:', err);
      }
    }
  };

  const handleUpdateColumnColor = async (columnId: string, color: string) => {
    if (!activeBoard) return;
    setBoards((prev) => {
      const updated = prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              columns: b.columns.map((c) => (c.id === columnId ? { ...c, color } : c)),
            }
          : b
      );
      if (currentUser) cacheBoardsLocally(currentUser.id, updated);
      else saveBoards(updated);
      return updated;
    });

    if (currentUser) {
      try {
        await updateColumnInSupabase(columnId, { color });
      } catch (err) {
        console.warn('Error updating column color in Supabase:', err);
      }
    }
  };

  const handleAddCard = async (columnId: string, text: string) => {
    if (!activeBoard) return;
    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        const targetCol = activeBoard.columns.find((c) => c.id === columnId);
        const position = targetCol ? targetCol.cards.length : 0;

        // 1. Send first to Supabase
        const createdCard = await createCardInSupabase(columnId, text, position);

        // 2. Update local state strictly upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? {
                  ...b,
                  columns: b.columns.map((col) =>
                    col.id === columnId
                      ? { ...col, cards: [...col.cards, createdCard] }
                      : col
                  ),
                }
              : b
          );
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        const guestCard: TaskCard = {
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
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? {
                  ...b,
                  columns: b.columns.map((col) =>
                    col.id === columnId
                      ? { ...col, cards: [...col.cards, guestCard] }
                      : col
                  ),
                }
              : b
          );
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear tarjeta en Supabase';
      console.error('Error al crear tarjeta en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo guardar la tarea en Supabase: ${msg}`);
    }
  };

  const handleSaveCard = async (updatedCard: TaskCard) => {
    if (!activeBoard) return;
    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // 1. Send first to Supabase
        await updateCardInSupabase(updatedCard);

        // 2. Update local state upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) => {
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

            if (newCols.some((col) => col.id === updatedCard.columnId)) {
              const targetCol = newCols.find((col) => col.id === updatedCard.columnId);
              if (targetCol && !targetCol.cards.some((c) => c.id === updatedCard.id)) {
                targetCol.cards.push(updatedCard);
              }
            }

            return { ...b, columns: newCols };
          });
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        setBoards((prev) => {
          const updated = prev.map((b) => {
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

            if (newCols.some((col) => col.id === updatedCard.columnId)) {
              const targetCol = newCols.find((col) => col.id === updatedCard.columnId);
              if (targetCol && !targetCol.cards.some((c) => c.id === updatedCard.id)) {
                targetCol.cards.push(updatedCard);
              }
            }

            return { ...b, columns: newCols };
          });
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar tarjeta en Supabase';
      console.error('Error al actualizar tarjeta en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo actualizar la tarea en Supabase: ${msg}`);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // 1. Send first to Supabase
        await deleteCardInSupabase(cardId);

        // 2. Update local state upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) => ({
            ...b,
            columns: b.columns.map((col) => ({
              ...col,
              cards: col.cards.filter((c) => c.id !== cardId),
            })),
          }));
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        setBoards((prev) => {
          const updated = prev.map((b) => ({
            ...b,
            columns: b.columns.map((col) => ({
              ...col,
              cards: col.cards.filter((c) => c.id !== cardId),
            })),
          }));
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar tarjeta en Supabase';
      console.error('Error al eliminar tarjeta en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo eliminar la tarea en Supabase: ${msg}`);
    }
  };

  const handleToggleComplete = async (cardId: string) => {
    if (!activeBoard) return;

    let targetCard: TaskCard | null = null;
    for (const col of activeBoard.columns) {
      const found = col.cards.find((c) => c.id === cardId);
      if (found) {
        targetCard = found;
        break;
      }
    }
    if (!targetCard) return;

    const nextState = !targetCard.completed;
    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // 1. Send first to Supabase
        await toggleCardCompleteInSupabase(cardId, nextState);

        // 2. Update local state upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) => ({
            ...b,
            columns: b.columns.map((col) => ({
              ...col,
              cards: col.cards.map((card) =>
                card.id === cardId ? { ...card, completed: nextState } : card
              ),
            })),
          }));
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        setBoards((prev) => {
          const updated = prev.map((b) => ({
            ...b,
            columns: b.columns.map((col) => ({
              ...col,
              cards: col.cards.map((card) =>
                card.id === cardId ? { ...card, completed: nextState } : card
              ),
            })),
          }));
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado en Supabase';
      console.error('Error al cambiar estado en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
    }
  };

  const handleMoveCard = async (cardId: string, targetColId: string) => {
    setSyncStatus('saving');
    setSyncError(null);

    try {
      const targetCol = activeBoard?.columns.find((c) => c.id === targetColId);
      const newPosition = targetCol ? targetCol.cards.length : 0;

      if (currentUser) {
        // 1. Send first to Supabase
        await moveCardColumnInSupabase(cardId, targetColId, newPosition);

        // 2. Update local state upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) => {
            let cardToMove: TaskCard | null = null;

            const columnsWithoutCard = b.columns.map((col) => {
              const match = col.cards.find((c) => c.id === cardId);
              if (match) cardToMove = { ...match, columnId: targetColId };
              return {
                ...col,
                cards: col.cards.filter((c) => c.id !== cardId),
              };
            });

            if (!cardToMove) return b;

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
          });
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        setBoards((prev) => {
          const updated = prev.map((b) => {
            let cardToMove: TaskCard | null = null;

            const columnsWithoutCard = b.columns.map((col) => {
              const match = col.cards.find((c) => c.id === cardId);
              if (match) cardToMove = { ...match, columnId: targetColId };
              return {
                ...col,
                cards: col.cards.filter((c) => c.id !== cardId),
              };
            });

            if (!cardToMove) return b;

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
          });
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al mover tarjeta en Supabase';
      console.error('Error al mover tarjeta en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo mover la tarjeta en Supabase: ${msg}`);
    }
  };

  const handleCopyCard = async (cardToCopy: TaskCard, targetColId: string) => {
    if (!activeBoard) return;
    setSyncStatus('saving');
    setSyncError(null);

    const targetCol = activeBoard.columns.find((c) => c.id === targetColId);
    const position = targetCol ? targetCol.cards.length : 0;
    const copiedText = cardToCopy.text.includes('(Copia)')
      ? cardToCopy.text
      : `${cardToCopy.text} (Copia)`;

    try {
      if (currentUser) {
        const createdCard = await createCardInSupabase(targetColId, copiedText, position);
        const fullCopiedCard: TaskCard = {
          ...cardToCopy,
          id: createdCard.id,
          columnId: targetColId,
          text: copiedText,
          position,
        };
        await updateCardInSupabase(fullCopiedCard);

        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? {
                  ...b,
                  columns: b.columns.map((col) =>
                    col.id === targetColId
                      ? { ...col, cards: [...col.cards, fullCopiedCard] }
                      : col
                  ),
                }
              : b
          );
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        const guestCopiedCard: TaskCard = {
          ...cardToCopy,
          id: 'card-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          columnId: targetColId,
          text: copiedText,
          position,
        };
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === activeBoard.id
              ? {
                  ...b,
                  columns: b.columns.map((col) =>
                    col.id === targetColId
                      ? { ...col, cards: [...col.cards, guestCopiedCard] }
                      : col
                  ),
                }
              : b
          );
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al copiar tarjeta';
      console.error('Error al copiar tarjeta:', err);
      setSyncStatus('error');
      setSyncError(msg);
    }
  };

  // --- Board Operations (Supabase First) ---

  const handleNewBoard = async () => {
    const name = prompt('Nombre del nuevo tablero:');
    if (!name || !name.trim()) return;

    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // 1. Create in Supabase first
        const newBoard = await createBoardInSupabase(currentUser.id, name.trim());

        // 2. Update local state
        setBoards((prev) => {
          const updated = [...prev, newBoard];
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
        setActiveBoardId(newBoard.id);
      } else {
        const newBoardId = 'board-' + Date.now();
        const guestBoard: Board = {
          id: newBoardId,
          name: name.trim(),
          description: '',
          backgroundColor: '#0f172a',
          accentColor: '#6366f1',
          columns: [
            {
              id: 'col-' + Date.now() + '-1',
              boardId: newBoardId,
              name: 'Por Hacer',
              position: 0,
              color: '#6366f1',
              cards: [],
            },
            {
              id: 'col-' + Date.now() + '-2',
              boardId: newBoardId,
              name: 'En Proceso',
              position: 1,
              color: '#f59e0b',
              cards: [],
            },
            {
              id: 'col-' + Date.now() + '-3',
              boardId: newBoardId,
              name: 'Hecho',
              position: 2,
              color: '#10b981',
              cards: [],
            },
          ],
        };
        setBoards((prev) => {
          const updated = [...prev, guestBoard];
          saveBoards(updated);
          return updated;
        });
        setActiveBoardId(newBoardId);
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear tablero en Supabase';
      console.error('Error al crear tablero en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo crear el tablero en Supabase: ${msg}`);
    }
  };

  const handleSaveBoard = async (
    boardId: string,
    name: string,
    description: string,
    color: string
  ) => {
    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // 1. Send first to Supabase
        await updateBoardInSupabase(boardId, {
          name,
          description,
          backgroundColor: color,
        });

        // 2. Update local state upon confirmed success
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === boardId
              ? { ...b, name, description, backgroundColor: color }
              : b
          );
          cacheBoardsLocally(currentUser.id, updated);
          return updated;
        });
      } else {
        setBoards((prev) => {
          const updated = prev.map((b) =>
            b.id === boardId
              ? { ...b, name, description, backgroundColor: color }
              : b
          );
          saveBoards(updated);
          return updated;
        });
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar tablero en Supabase';
      console.error('Error al actualizar tablero en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo actualizar el tablero en Supabase: ${msg}`);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    const remaining = boards.filter((b) => b.id !== boardId);
    if (remaining.length === 0) {
      alert('Debes mantener al menos un tablero activo.');
      return;
    }

    setSyncStatus('saving');
    setSyncError(null);

    try {
      if (currentUser) {
        // 1. Delete in Supabase first
        await deleteBoardInSupabase(boardId);

        // 2. Update local state
        setBoards(remaining);
        setActiveBoardId(remaining[0].id);
        cacheBoardsLocally(currentUser.id, remaining);
      } else {
        setBoards(remaining);
        setActiveBoardId(remaining[0].id);
        saveBoards(remaining);
      }
      setSyncStatus(currentUser ? 'synced' : 'offline');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar tablero en Supabase';
      console.error('Error al eliminar tablero en Supabase:', err);
      setSyncStatus('error');
      setSyncError(msg);
      alert(`No se pudo eliminar el tablero en Supabase: ${msg}`);
    }
  };

  const handleAddMember = (memberData: Omit<BoardMember, 'id' | 'joinedAt'>) => {
    if (!activeBoard) return;
    const newMember: BoardMember = {
      ...memberData,
      id: 'member-' + Date.now(),
      joinedAt: getLocalDateString(),
    };

    setBoards((prev) => {
      const updated = prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              members: [...(b.members || []), newMember],
            }
          : b
      );
      if (currentUser) cacheBoardsLocally(currentUser.id, updated);
      else saveBoards(updated);
      return updated;
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!activeBoard) return;
    setBoards((prev) => {
      const updated = prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              members: (b.members || []).filter((m) => m.id !== memberId),
            }
          : b
      );
      if (currentUser) cacheBoardsLocally(currentUser.id, updated);
      else saveBoards(updated);
      return updated;
    });
  };

  const handleUpdateMemberRole = (memberId: string, newRole: BoardMember['role']) => {
    if (!activeBoard) return;
    setBoards((prev) => {
      const updated = prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              members: (b.members || []).map((m) =>
                m.id === memberId ? { ...m, role: newRole } : m
              ),
            }
          : b
      );
      if (currentUser) cacheBoardsLocally(currentUser.id, updated);
      else saveBoards(updated);
      return updated;
    });
  };

  const handleJoinBoardWithCode = (code: string) => {
    if (!activeBoard) return;
    const matchedBoard = boards.find(
      (b) =>
        b.inviteCode === code ||
        `TASK-${b.id.slice(-4).toUpperCase()}` === code
    );
    if (matchedBoard) {
      setActiveBoardId(matchedBoard.id);
    } else {
      handleAddMember({
        name: currentUser?.email.split('@')[0] || 'Nuevo Colaborador',
        email: currentUser?.email || 'colaborador@equipo.com',
        role: 'member',
        avatarColor: '#10b981',
      });
    }
  };

  const handlePrintBoard = () => {
    if (activeView !== 'tablero') {
      setActiveView('tablero');
    }
    setTimeout(() => {
      window.print();
    }, 250);
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

  // Loading Screen while resolving Supabase session & authoritative data
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-4 animate-pulse">
          <Hammer className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-base font-bold tracking-tight">
          <span className="text-indigo-400">Task</span>
          <span className="text-cyan-400">Forge</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Conectando con Supabase · Fuente de la Verdad...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* App Header with brand, version, notifications, theme, sync status and user */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenWorkgroup={() => setIsWorkgroupOpen(true)}
        onPrint={handlePrintBoard}
        memberCount={activeBoard?.members?.length || 1}
        alertCount={alertCount}
        themeMode={themeMode}
        onSelectThemeMode={setThemeMode}
        currentUser={currentUser}
        syncStatus={syncStatus}
      />

      {/* Sync Error Banner if any */}
      {syncError && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 px-4 py-2 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Aviso de Supabase:</strong> {syncError}
            </span>
          </div>
          <button
            onClick={() => currentUser && loadAuthoritativeData(currentUser.id)}
            className="flex items-center gap-1 font-bold underline hover:no-underline ml-4"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}

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
                onMoveColumn={handleMoveColumn}
                onUpdateColumnColor={handleUpdateColumnColor}
                onAddCard={handleAddCard}
                onCardClick={handleCardClick}
                onToggleComplete={handleToggleComplete}
                onMoveCard={handleMoveCard}
                onCopyCard={handleCopyCard}
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
        members={activeBoard?.members || []}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        onCopy={handleCopyCard}
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

      {activeBoard && (
        <WorkgroupModal
          isOpen={isWorkgroupOpen}
          onClose={() => setIsWorkgroupOpen(false)}
          board={activeBoard}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onUpdateMemberRole={handleUpdateMemberRole}
          onJoinBoardWithCode={handleJoinBoardWithCode}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          if (user) {
            loadAuthoritativeData(user.id);
          } else {
            const guestBoards = getInitialBoards();
            setBoards(guestBoards);
            setActiveBoardId(guestBoards[0]?.id || '');
            setSyncStatus('offline');
          }
        }}
      />
    </div>
  );
}
