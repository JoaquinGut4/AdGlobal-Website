import { useState } from 'react';
import type { FormEvent } from 'react';
import { Power, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { STORAGE_KEYS } from '@/config/site';
import { NAV_ITEMS } from '@/config/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AdminSection, UsuarioAdministrador } from '@/types';

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5C94]';

export function ConfiguracionPage() {
  const [users, setUsers] = useLocalStorage<UsuarioAdministrador[]>(STORAGE_KEYS.usuarios, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [modulos, setModulos] = useState<AdminSection[]>(['dashboard']);
  const [error, setError] = useState('');

  const toggleModule = (module: AdminSection) => {
    setModulos((current) =>
      current.includes(module) ? current.filter((item) => item !== module) : [...current, module],
    );
  };

  const createUser = (event: FormEvent) => {
    event.preventDefault();
    if (users.some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('Ya existe una cuenta con ese correo.');
      return;
    }
    if (users.some((item) => item.usuario.toLowerCase() === usuario.trim().toLowerCase())) {
      setError('El nombre de usuario ya está registrado.');
      return;
    }
    if (modulos.length === 0) {
      setError('Activa al menos un módulo para la cuenta.');
      return;
    }

    const nextUser: UsuarioAdministrador = {
      id: `admin-user-${Date.now()}`,
      nombre: nombre.trim(),
      email: email.trim(),
      usuario: usuario.trim(),
      password,
      activo: true,
      modulos,
      createdAt: new Date().toISOString(),
    };
    setUsers((current) => [...current, nextUser]);
    setNombre('');
    setEmail('');
    setUsuario('');
    setPassword('');
    setModulos(['dashboard']);
    setError('');
    setIsModalOpen(false);
  };

  const updateUser = (id: string, update: (user: UsuarioAdministrador) => UsuarioAdministrador) => {
    setUsers((current) => current.map((user) => (user.id === id ? update(user) : user)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Usuarios administradores</h2>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#2B5C94]">
              {users.length + 1} cuentas
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Crea cuentas administrativas y controla los módulos disponibles para cada usuario
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#2B5C94] px-3.5 text-xs font-bold text-white hover:bg-[#1F4778]"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2B5C94] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Administrador principal</p>
              <p className="text-xs text-slate-500">admin@adglobalperu.com · adglobal_admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Activo</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-[#2B5C94]">Todos los módulos</span>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
          <Users className="h-9 w-9 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-600">No hay usuarios adicionales</p>
          <p className="mt-1 text-xs text-slate-500">Crea una cuenta para configurar su acceso por módulos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <article key={user.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{user.nombre}</p>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Administrador</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{user.email} · {user.usuario}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateUser(user.id, (current) => ({ ...current, activo: !current.activo }))}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    user.activo
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-100 text-slate-500'
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  {user.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </button>
              </div>

              <div className="pt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Módulos habilitados</p>
                <div className="flex flex-wrap gap-2">
                  {NAV_ITEMS.map((module) => {
                    const enabled = user.modulos.includes(module.id);
                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() =>
                          updateUser(user.id, (current) => ({
                            ...current,
                            modulos: enabled
                              ? current.modulos.filter((item) => item !== module.id)
                              : [...current.modulos, module.id],
                          }))
                        }
                        className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${
                          enabled
                            ? 'border-blue-200 bg-blue-50 text-[#2B5C94]'
                            : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        {module.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labelledBy="new-admin-user-title"
        title="Crear usuario administrador"
        subtitle="Define las credenciales y módulos habilitados"
        icon={<UserPlus className="h-4 w-4" />}
        headerClass="bg-[#2B5C94]"
        panelClass="max-w-2xl"
      >
        <form onSubmit={createUser} className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Nombre completo *</label>
              <input required value={nombre} onChange={(event) => setNombre(event.target.value)} className={FIELD_CLASS} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Correo *</label>
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={FIELD_CLASS} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Usuario *</label>
              <input required value={usuario} onChange={(event) => setUsuario(event.target.value)} className={FIELD_CLASS} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-600">Contraseña *</label>
              <input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className={FIELD_CLASS} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-slate-600">Módulos disponibles *</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NAV_ITEMS.map((module) => {
                const enabled = modulos.includes(module.id);
                return (
                  <label key={module.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${enabled ? 'border-blue-200 bg-blue-50 text-[#2B5C94]' : 'border-slate-200 text-slate-500'}`}>
                    <input type="checkbox" checked={enabled} onChange={() => toggleModule(module.id)} />
                    {module.label}
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" className="cursor-pointer rounded-xl bg-[#2B5C94] px-5 py-2 text-xs font-bold text-white hover:bg-[#1F4778]">Crear usuario</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
