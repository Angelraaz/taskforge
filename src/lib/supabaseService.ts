import { supabase } from './supabase';
import { Board, BoardColumn, TaskCard } from '../types';

const LOCAL_CACHE_KEY = 'gtajrc_supabase_cache_v1';

/**
 * Parses Supabase timestamp / string safely to avoid HTML5 input errors.
 */
function parseSupabaseDueDate(raw: string | null | undefined): { dueDate: string; dueTime: string } {
  if (!raw) return { dueDate: '', dueTime: '' };
  const normalized = raw.replace(' ', 'T');
  const [datePart, rest] = normalized.split('T');
  const dueDate = datePart ? datePart.substring(0, 10) : '';
  const dueTime = rest ? rest.substring(0, 5) : '';
  return { dueDate, dueTime };
}

/**
 * Saves current boards to localStorage ONLY as a read-cache, never as the authoritative source.
 */
export function cacheBoardsLocally(userId: string, boards: Board[]) {
  try {
    localStorage.setItem(`${LOCAL_CACHE_KEY}_${userId}`, JSON.stringify(boards));
  } catch (err) {
    console.warn('Error saving local cache:', err);
  }
}

/**
 * Retrieves cached boards strictly as a placeholder while Supabase is fetching.
 */
export function getLocalCachedBoards(userId: string): Board[] | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_CACHE_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * 1. SINGLE SOURCE OF TRUTH: Fetch authoritative data directly from Supabase.
 */
export async function fetchAuthoritativeBoards(userId: string): Promise<Board[]> {
  try {
    // 1. Fetch user boards
    const { data: boardsData, error: boardsErr } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (boardsErr) {
      throw new Error(`Error al consultar tableros en Supabase: ${boardsErr.message}`);
    }

    // If user has zero boards in Supabase, initialize a fresh default board directly in Supabase
    if (!boardsData || boardsData.length === 0) {
      const defaultBoard = await createInitialSupabaseBoard(userId);
      cacheBoardsLocally(userId, [defaultBoard]);
      return [defaultBoard];
    }

    const loadedBoards: Board[] = [];

    for (const b of boardsData) {
      // 2. Fetch columns for this board
      const { data: colsData, error: colsErr } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', b.id)
        .order('position', { ascending: true });

      if (colsErr) {
        throw new Error(`Error al consultar columnas: ${colsErr.message}`);
      }

      const columns: BoardColumn[] = [];

      for (const c of colsData || []) {
        // 3. Fetch cards for this column
        const { data: cardsData, error: cardsErr } = await supabase
          .from('cards')
          .select('*')
          .eq('column_id', c.id)
          .order('position', { ascending: true });

        if (cardsErr) {
          throw new Error(`Error al consultar tarjetas: ${cardsErr.message}`);
        }

        const cards: TaskCard[] = (cardsData || []).map((k) => {
          const { dueDate, dueTime } = parseSupabaseDueDate(k.due_date);
          const { dueDate: startDate, dueTime: startTime } = parseSupabaseDueDate(k.start_date);
          return {
            id: k.id,
            columnId: c.id,
            text: k.text || '',
            description: k.description || '',
            startDate: startDate || undefined,
            startTime: startTime || undefined,
            dueDate,
            dueTime,
            completed: Boolean(k.completed),
            colorTag: k.color_tag || 'indigo',
            assigneeId: k.assignee_id || undefined,
            labels: Array.isArray(k.labels) ? k.labels : [],
            checklist: Array.isArray(k.checklist) ? k.checklist : [],
            position: k.position ?? 0,
            createdAt: k.created_at,
          };
        });

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
        members: b.members || [
          {
            id: 'member-owner',
            name: 'Tú (Líder de Proyecto)',
            email: 'organizador@taskforge.app',
            role: 'owner',
            avatarColor: '#6366f1',
            joinedAt: new Date().toISOString().slice(0, 10),
          },
        ],
        inviteCode: b.invite_code || `TASK-${b.id.slice(-4).toUpperCase()}`,
        createdAt: b.created_at,
      });
    }

    // Save to cache after confirming fresh data from Supabase
    cacheBoardsLocally(userId, loadedBoards);
    return loadedBoards;
  } catch (err: unknown) {
    console.warn('Fallo al consultar Supabase (modo sin conexión), revisando caché:', err);
    const cached = getLocalCachedBoards(userId);
    if (cached && cached.length > 0) {
      return cached;
    }
    throw err;
  }
}

/**
 * Creates default board structure directly on Supabase for a new user.
 */
async function createInitialSupabaseBoard(userId: string): Promise<Board> {
  const { data: newBoard, error: bErr } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      name: '🚀 Mi Tablero Principal',
      description: 'Tablero sincronizado en tiempo real con Supabase',
      background_color: '#0f172a',
    })
    .select()
    .single();

  if (bErr || !newBoard) {
    throw new Error(`Error al inicializar tablero en Supabase: ${bErr?.message}`);
  }

  const defaultColNames = [
    { name: 'Por Hacer', color: '#6366f1' },
    { name: 'En Proceso', color: '#f59e0b' },
    { name: 'Completado', color: '#10b981' },
  ];

  const columns: BoardColumn[] = [];

  for (let i = 0; i < defaultColNames.length; i++) {
    const { data: colData, error: cErr } = await supabase
      .from('columns')
      .insert({
        board_id: newBoard.id,
        name: defaultColNames[i].name,
        position: i,
        color: defaultColNames[i].color,
      })
      .select()
      .single();

    if (!cErr && colData) {
      columns.push({
        id: colData.id,
        boardId: newBoard.id,
        name: colData.name,
        position: colData.position,
        color: colData.color,
        cards: [],
      });
    }
  }

  return {
    id: newBoard.id,
    name: newBoard.name,
    description: newBoard.description || '',
    backgroundColor: newBoard.background_color || '#0f172a',
    columns,
  };
}

// ========================================================
// ROBUST ASYNC MUTATION FUNCTIONS (Supabase-first)
// ========================================================

/**
 * Create a new board in Supabase first.
 */
export async function createBoardInSupabase(
  userId: string,
  name: string,
  description = '',
  backgroundColor = '#0f172a'
): Promise<Board> {
  const { data: boardData, error: bErr } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      name: name.trim(),
      description: description.trim(),
      background_color: backgroundColor,
    })
    .select()
    .single();

  if (bErr || !boardData) {
    throw new Error(`Error al crear tablero en Supabase: ${bErr?.message}`);
  }

  const defaultCols = [
    { name: 'Por Hacer', color: '#6366f1' },
    { name: 'En Proceso', color: '#f59e0b' },
    { name: 'Completado', color: '#10b981' },
  ];

  const columns: BoardColumn[] = [];
  for (let i = 0; i < defaultCols.length; i++) {
    const { data: colData, error: cErr } = await supabase
      .from('columns')
      .insert({
        board_id: boardData.id,
        name: defaultCols[i].name,
        position: i,
        color: defaultCols[i].color,
      })
      .select()
      .single();

    if (!cErr && colData) {
      columns.push({
        id: colData.id,
        boardId: boardData.id,
        name: colData.name,
        position: colData.position,
        color: colData.color,
        cards: [],
      });
    }
  }

  return {
    id: boardData.id,
    name: boardData.name,
    description: boardData.description || '',
    backgroundColor: boardData.background_color || '#0f172a',
    columns,
  };
}

/**
 * Update an existing board in Supabase.
 */
export async function updateBoardInSupabase(
  boardId: string,
  updates: { name?: string; description?: string; backgroundColor?: string }
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.description !== undefined) payload.description = updates.description.trim();
  if (updates.backgroundColor !== undefined) payload.background_color = updates.backgroundColor;

  const { error } = await supabase.from('boards').update(payload).eq('id', boardId);
  if (error) {
    throw new Error(`Error al actualizar tablero en Supabase: ${error.message}`);
  }
}

/**
 * Delete a board from Supabase with safe cascading deletion of cards & columns.
 */
export async function deleteBoardInSupabase(boardId: string): Promise<void> {
  // Cascading cleanup in case PostgreSQL foreign keys lack ON DELETE CASCADE
  try {
    const { data: cols } = await supabase.from('columns').select('id').eq('board_id', boardId);
    if (cols && cols.length > 0) {
      const colIds = cols.map((c) => c.id);
      await supabase.from('cards').delete().in('column_id', colIds);
      await supabase.from('columns').delete().eq('board_id', boardId);
    }
  } catch (cleanErr) {
    console.warn('Pre-cleanup error during board deletion:', cleanErr);
  }

  const { error } = await supabase.from('boards').delete().eq('id', boardId);
  if (error) {
    throw new Error(`Error al eliminar tablero en Supabase: ${error.message}`);
  }
}

/**
 * Create a new column in Supabase first.
 */
export async function createColumnInSupabase(
  boardId: string,
  name: string,
  position: number,
  color = '#6366f1'
): Promise<BoardColumn> {
  const { data, error } = await supabase
    .from('columns')
    .insert({
      board_id: boardId,
      name: name.trim(),
      position,
      color,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Error al crear columna en Supabase: ${error?.message}`);
  }

  return {
    id: data.id,
    boardId: data.board_id,
    name: data.name,
    position: data.position,
    color: data.color,
    cards: [],
  };
}

/**
 * Update a column in Supabase.
 */
export async function updateColumnInSupabase(
  columnId: string,
  updates: { name?: string; color?: string; position?: number }
): Promise<void> {
  const { error } = await supabase.from('columns').update(updates).eq('id', columnId);
  if (error) {
    throw new Error(`Error al actualizar columna en Supabase: ${error.message}`);
  }
}

/**
 * Delete a column from Supabase with safe cascading deletion of its cards.
 */
export async function deleteColumnInSupabase(columnId: string): Promise<void> {
  // Delete associated cards first to prevent foreign key constraint rejections
  try {
    await supabase.from('cards').delete().eq('column_id', columnId);
  } catch (cleanErr) {
    console.warn('Pre-cleanup error during column deletion:', cleanErr);
  }

  const { error } = await supabase.from('columns').delete().eq('id', columnId);
  if (error) {
    throw new Error(`Error al eliminar columna en Supabase: ${error.message}`);
  }
}

/**
 * Create a new card in Supabase first.
 */
export async function createCardInSupabase(
  columnId: string,
  text: string,
  position: number
): Promise<TaskCard> {
  const { data, error } = await supabase
    .from('cards')
    .insert({
      column_id: columnId,
      text: text.trim(),
      description: '',
      completed: false,
      color_tag: 'indigo',
      position,
      labels: [],
      checklist: [],
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Error al crear tarjeta en Supabase: ${error?.message}`);
  }

  const { dueDate, dueTime } = parseSupabaseDueDate(data.due_date);

  return {
    id: data.id,
    columnId: data.column_id,
    text: data.text,
    description: data.description || '',
    dueDate,
    dueTime,
    completed: Boolean(data.completed),
    colorTag: data.color_tag || 'indigo',
    labels: data.labels || [],
    checklist: data.checklist || [],
    position: data.position ?? position,
  };
}

/**
 * Update a card in Supabase with full type safety (including color_tag!).
 */
export async function updateCardInSupabase(card: TaskCard): Promise<void> {
  const dueDateFormatted = card.dueDate
    ? card.dueDate + (card.dueTime ? `T${card.dueTime}:00` : 'T09:00:00')
    : null;
  const startDateFormatted = card.startDate
    ? card.startDate + (card.startTime ? `T${card.startTime}:00` : 'T09:00:00')
    : null;

  const payload: Record<string, unknown> = {
    column_id: card.columnId,
    text: card.text.trim(),
    description: card.description || '',
    due_date: dueDateFormatted,
    completed: card.completed,
    color_tag: card.colorTag || 'indigo',
    labels: card.labels || [],
    checklist: card.checklist || [],
    position: card.position ?? 0,
  };
  if (startDateFormatted) payload.start_date = startDateFormatted;
  if (card.assigneeId) payload.assignee_id = card.assigneeId;

  const { error } = await supabase.from('cards').update(payload).eq('id', card.id);

  if (error) {
    if (error.message && (error.message.includes('start_date') || error.message.includes('assignee_id'))) {
      delete payload.start_date;
      delete payload.assignee_id;
      const { error: retryErr } = await supabase.from('cards').update(payload).eq('id', card.id);
      if (retryErr) throw new Error(`Error al actualizar tarjeta en Supabase: ${retryErr.message}`);
      return;
    }
    throw new Error(`Error al actualizar tarjeta en Supabase: ${error.message}`);
  }
}

/**
 * Move a card to another column in Supabase and optionally update its position.
 */
export async function moveCardColumnInSupabase(
  cardId: string,
  targetColumnId: string,
  newPosition?: number
): Promise<void> {
  const payload: { column_id: string; position?: number } = { column_id: targetColumnId };
  if (typeof newPosition === 'number') {
    payload.position = newPosition;
  }

  const { error } = await supabase
    .from('cards')
    .update(payload)
    .eq('id', cardId);

  if (error) {
    throw new Error(`Error al mover tarjeta en Supabase: ${error.message}`);
  }
}

/**
 * Toggle completed state of a card in Supabase.
 */
export async function toggleCardCompleteInSupabase(cardId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ completed })
    .eq('id', cardId);

  if (error) {
    throw new Error(`Error al actualizar estado en Supabase: ${error.message}`);
  }
}

/**
 * Delete a card from Supabase.
 */
export async function deleteCardInSupabase(cardId: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', cardId);
  if (error) {
    throw new Error(`Error al eliminar tarjeta en Supabase: ${error.message}`);
  }
}
