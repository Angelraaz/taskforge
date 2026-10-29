import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Copy,
  Check,
  Trash2,
  Share2,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { Board, BoardMember } from '../types';

interface WorkgroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  onAddMember: (member: Omit<BoardMember, 'id' | 'joinedAt'>) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMemberRole: (memberId: string, newRole: BoardMember['role']) => void;
  onJoinBoardWithCode?: (code: string) => void;
}

const MEMBER_AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export const WorkgroupModal: React.FC<WorkgroupModalProps> = ({
  isOpen,
  onClose,
  board,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onJoinBoardWithCode,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<BoardMember['role']>('member');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<string | null>(null);

  // Generate deterministic or stored invite code
  const inviteCode = board.inviteCode || `TASK-${board.id.slice(-4).toUpperCase()}`;
  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?board=${inviteCode}`
    : `https://taskforge.app/?board=${inviteCode}`;

  const members = board.members || [
    {
      id: 'owner-1',
      name: 'Tú (Propietario)',
      email: 'organizador@taskforge.app',
      role: 'owner',
      avatarColor: '#6366f1',
      joinedAt: new Date().toISOString().slice(0, 10),
    },
  ];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Pick random or cycle avatar color
    const randomColor =
      MEMBER_AVATAR_COLORS[Math.floor(Math.random() * MEMBER_AVATAR_COLORS.length)];

    onAddMember({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@equipo.com`,
      role,
      avatarColor: randomColor,
    });

    setName('');
    setEmail('');
    setRole('member');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    if (onJoinBoardWithCode) {
      onJoinBoardWithCode(joinCodeInput.trim().toUpperCase());
      setJoinFeedback('¡Te has unido con éxito al grupo de trabajo!');
      setTimeout(() => {
        setJoinFeedback(null);
        setJoinCodeInput('');
      }, 2500);
    }
  };

  const getRoleLabel = (r: BoardMember['role']) => {
    switch (r) {
      case 'owner':
        return { label: 'Propietario', icon: <ShieldAlert className="w-3 h-3 text-amber-500" />, badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
      case 'admin':
        return { label: 'Administrador', icon: <ShieldCheck className="w-3 h-3 text-indigo-500" />, badge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' };
      case 'member':
        return { label: 'Editor', icon: <Shield className="w-3 h-3 text-emerald-500" />, badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
      case 'viewer':
        return { label: 'Observador', icon: <Eye className="w-3 h-3 text-slate-500" />, badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Grupo de Trabajo y Colaboradores
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tablero: <span className="font-semibold text-slate-700 dark:text-slate-200">{board.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scroll flex-1">
          {/* Share & Invite Link Card */}
          <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                Invitar a otra persona con Código o Enlace
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Código Activo
              </span>
            </div>

            <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              Comparte este código o enlace con tus compañeros para que puedan unirse y colaborar en este tablero en tiempo real.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
              {/* Code badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700 font-mono text-xs font-bold text-slate-800 dark:text-white flex-1 min-w-[120px]">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{inviteCode}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
              </button>
            </div>
          </div>

          {/* Add member form */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
              Agregar Miembro al Grupo
            </h3>

            <form onSubmit={handleInviteSubmit} className="space-y-2.5 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nombre o Apodo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. María Gómez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="maria@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Rol:
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as BoardMember['role'])}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="admin">Administrador (Control total)</option>
                    <option value="member">Editor (Crear y editar tareas)</option>
                    <option value="viewer">Observador (Solo lectura)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Agregar al Grupo</span>
                </button>
              </div>
            </form>
          </div>

          {/* Members List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Miembros del Grupo ({members.length})
              </h3>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scroll">
              {members.map((member) => {
                const roleConfig = getRoleLabel(member.role);
                const isOwner = member.role === 'owner';

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: member.avatarColor || '#6366f1' }}
                      >
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isOwner && (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                              Propietario
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isOwner ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            onUpdateMemberRole(
                              member.id,
                              e.target.value as BoardMember['role']
                            )
                          }
                          className="text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Editor</option>
                          <option value="viewer">Observador</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${roleConfig.badge}`}
                        >
                          {roleConfig.icon}
                          {roleConfig.label}
                        </span>
                      )}

                      {!isOwner && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Eliminar del grupo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Join an existing board with code */}
          {onJoinBoardWithCode && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                ¿Tienes un código de otro tablero?
              </span>
              <form onSubmit={handleJoinSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. TASK-9182"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono font-bold"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Unirme al Tablero
                </button>
              </form>
              {joinFeedback && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                  {joinFeedback}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
