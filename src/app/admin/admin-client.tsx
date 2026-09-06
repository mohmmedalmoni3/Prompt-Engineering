'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface Registration {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  field: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  motivation: string;
  created_at: string;
}

interface Stats {
  total: number;
  today: number;
  week: number;
  cities: number;
  pending: number;
}

interface RegistrationsResponse {
  registrations: Registration[];
  stats: Stats;
  registrationOpen?: boolean;
}

type View = 'loading' | 'login' | 'dashboard';

const EXPERIENCE_LABEL: Record<Registration['experience'], string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم'
};

const EXPERIENCE_COLOR: Record<Registration['experience'], string> = {
  beginner: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  intermediate: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  advanced: 'bg-[#7c3aed]/15 text-purple-200 border-[#7c3aed]/25'
};

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function AdminClient() {
  const [view, setView] = useState<View>('loading');
  const [data, setData] = useState<RegistrationsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [regOpen, setRegOpen] = useState(true);
  const [regToggleBusy, setRegToggleBusy] = useState(false);

  const load = useCallback(async (query: string) => {
    const res = await fetch(`/api/admin/registrations?search=${encodeURIComponent(query)}`);
    if (res.status === 401) throw new Error('unauthorized');
    if (!res.ok) throw new Error('failed');
    return (await res.json()) as RegistrationsResponse;
  }, []);

  const refresh = useCallback(
    async (silent = false) => {
      try {
        const result = await load(search);
        setData(result);
        if (typeof result.registrationOpen === 'boolean') setRegOpen(result.registrationOpen);
        setView('dashboard');
      } catch {
        if (!silent) setView('login');
      }
    },
    [load, search]
  );

  // Check existing session on mount — if there's no session, show the login view
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    if (view !== 'dashboard') return;
    const t = setTimeout(() => refresh(true), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, view]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginBusy(true);

    const form = new FormData(e.currentTarget as HTMLFormElement);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: String(form.get('username') ?? ''),
          password: String(form.get('password') ?? '')
        })
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setLoginError(body?.error ?? 'تعذر تسجيل الدخول');
        return;
      }

      await refresh();
      flash('تم تسجيل الدخول بنجاح');
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setView('login');
      setData(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا المسجل؟')) return;
    setDeleteBusyId(id);
    try {
      const res = await fetch(`/api/admin/registrations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                registrations: prev.registrations.filter((r) => r.id !== id),
                stats: { ...prev.stats, total: prev.stats.total - 1 }
              }
            : prev
        );
        flash('تم حذف السجل');
      } else {
        flash('تعذر حذف السجل');
      }
    } finally {
      setDeleteBusyId(null);
    }
  }

  async function toggleRegistration() {
    if (regToggleBusy) return;
    setRegToggleBusy(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open: !regOpen })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        flash('تعذر تحديث الحالة');
        return;
      }
      const next = body?.open === true;
      setRegOpen(next);
      flash(next ? 'تم فتح التسجيل — أُرسل للزوار' : 'تم إغلاق التسجيل — أصبحت صفحة التسجيل مغلقة');
    } catch {
      flash('تعذر الاتصال بالخادم');
    } finally {
      setRegToggleBusy(false);
    }
  }

  function exportCsv() {
    if (!data) return;

    const header = [
      'الاسم الكامل',
      'البريد الإلكتروني',
      'الواتساب',
      'المحافظة',
      'المجال',
      'مستوى الخبرة',
      'الدافع',
      'تاريخ التسجيل'
    ];

    const lines = data.registrations.map((r) =>
      [
        r.full_name,
        r.email,
        r.phone,
        r.city,
        r.field,
        EXPERIENCE_LABEL[r.experience],
        r.motivation,
        new Date(r.created_at).toLocaleString('ar')
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );

    const blob = new Blob(['\ufeff' + [header.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash('تم تنزيل ملف CSV');
  }

  // ---------------------------------------------------------------- loading

  if (view === 'loading') {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <svg className='h-8 w-8 animate-spin text-[#4f46e5]' viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' strokeDasharray='50' strokeDashoffset='15' />
          </svg>
          <p className='text-sm text-white/45'>جاري التحقق...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- login

  if (view === 'login') {
    return (
      <div className='mx-auto mt-10 max-w-sm'>
        <div className='overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f1e]/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl'>
          <div className='mb-6 flex justify-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b5bdb] to-[#7c3aed] shadow-lg shadow-[#4f46e5]/30'>
              <svg className='h-7 w-7 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M12 2v4M12 22v-4M4.9 4.9l2.8 2.8M19.1 4.9l-2.8 2.8M2 12h4M22 12h-4M4.9 19.1l2.8-2.8M19.1 19.1l-2.8-2.8' />
                <circle cx='12' cy='12' r='3' />
              </svg>
            </div>
          </div>

          <h2 className='mb-1 text-center text-lg font-extrabold'>تسجيل الدخول</h2>
          <p className='mb-6 text-center text-xs text-white/45'>الوصول مخصص للإدارة فقط</p>

          {loginError && (
            <div className='mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs font-medium text-red-200'>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className='space-y-4'>
            <div>
              <label htmlFor='username' className='mb-1.5 block text-xs font-semibold text-white/65'>
                اسم المستخدم
              </label>
              <input
                id='username'
                name='username'
                type='text'
                autoComplete='username'
                required
                className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/30'
              />
            </div>

            <div>
              <label htmlFor='password' className='mb-1.5 block text-xs font-semibold text-white/65'>
                كلمة المرور
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/30'
                />
                <button
                  type='button'
                  aria-label='إظهار كلمة المرور'
                  onClick={() => setShowPassword((s) => !s)}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70'
                >
                  {showPassword ? (
                    <svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M3 3l18 18M10.5 5.2A10.6 10.6 0 0 1 12 5c7 0 9 7 9 7a17.5 17.5 0 0 1-2.3 3.2M6.6 6.6A17.2 17.2 0 0 0 3 12s2 7 9 7a10 10 0 0 0 3.7-.7' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M9.9 9.9a3 3 0 0 0 4.2 4.2' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  ) : (
                    <svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z' strokeLinecap='round' strokeLinejoin='round' />
                      <circle cx='12' cy='12' r='3' />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loginBusy}
              className='w-full rounded-xl bg-gradient-to-l from-[#3b5bdb] to-[#7c3aed] py-3 text-sm font-extrabold text-white` shadow-lg shadow-[#4f46e5]/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60'
            >
              {loginBusy ? 'جاري الدخول...' : 'دخول'}
            </button>

            <Link href='/register' className='block text-center text-[11px] text-white/35 transition hover:text-indigo-300'>
              → العودة لصفحة التسجيل
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- dashboard

  const { registrations, stats } = data ?? { registrations: [], stats: null };

  const statCards = [
    { label: 'إجمالي المسجلين', value: stats?.total ?? 0, icon: '👥', accent: 'from-[#4f46e5]/20 to-[#4f46e5]/5 border-[#4f46e5]/25' },
    { label: 'مسجلون اليوم', value: stats?.today ?? 0, icon: '⚡', accent: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/25' },
    { label: 'هذا الأسبوع', value: stats?.week ?? 0, icon: '📅', accent: 'from-amber-500/20 to-amber-500/5 border-amber-500/25' },
    { label: 'مدن مختلفة', value: stats?.cities ?? 0, icon: '📍', accent: 'from-[#7c3aed]/20 to-[#7c3aed]/5 border-[#7c3aed]/25' }
  ];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className='fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-[#161a2e] px-5 py-3 text-sm font-semibold shadow-2xl'>
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <div className='relative flex-1 min-w-[220px] max-w-md'>
          <svg className='absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='11' cy='11' r='7' />
            <path d='m21 21-4.3-4.3' strokeLinecap='round' />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='ابحث بالاسم، البريد، الواتساب، المحافظة أو المجال...'
            className='w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-10 pl-10 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/30'
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white'
              aria-label='مسح البحث'
            >
              ✕
            </button>
          )}
        </div>

        <div className='flex gap-2'>
          <button
            onClick={toggleRegistration}
            disabled={regToggleBusy}
            title={regOpen ? 'اضغط لإغلاق التسجيل' : 'اضغط لفتح التسجيل'}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              regOpen
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
            } ${regToggleBusy ? 'cursor-wait opacity-60' : ''}`}
          >
            {regToggleBusy ? (
              <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M12 3a9 9 0 1 0 9 9' strokeLinecap='round' />
              </svg>
            ) : regOpen ? (
              <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <rect x='4' y='11' width='16' height='10' rx='2' />
                <path d='M8 11V7a4 4 0 0 1 8 0v4' />
              </svg>
            ) : (
              <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <rect x='4' y='11' width='16' height='10' rx='2' />
                <path d='M8 11V7a4 4 0 0 1 7.5-3.6' />
              </svg>
            )}
            {regOpen ? 'التسجيل مفتوح' : 'التسجيل مغلق'}
          </button>
          <button
            onClick={exportCsv}
            className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/75 transition hover:border-emerald-500/40 hover:text-white'
          >
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            تصدير CSV
          </button>
          <button
            onClick={handleLogout}
            className='inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20'
          >
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            خروج
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border bg-gradient-to-b p-4 ${s.accent}`}
          >
            <div className='flex items-center justify-between'>
              <p className='text-xs font-semibold text-white/60'>{s.label}</p>
              <span className='text-base'>{s.icon}</span>
            </div>
            <p className='mt-2 text-3xl font-extrabold tabular-nums'>{s.value.toLocaleString('ar-EG')}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f1e]/70 backdrop-blur-md'>
        <div className='flex items-center justify-between border-b border-white/10 px-5 py-4'>
          <h2 className='text-sm font-extrabold'>قائمة المسجلين</h2>
          <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/55'>
            {registrations.length} سجل
          </span>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-[900px] text-right text-sm'>
            <thead>
              <tr className='border-b border-white/10 text-[11px] text-white/40'>
                <th className='px-5 py-3 font-semibold'>الاسم</th>
                <th className='px-5 py-3 font-semibold'>البريد الإلكتروني</th>
                <th className='px-5 py-3 font-semibold'>الواتساب</th>
                <th className='px-5 py-3 font-semibold'>المحافظة</th>
                <th className='px-5 py-3 font-semibold'>المجال</th>
                <th className='px-5 py-3 font-semibold'>الخبرة</th>
                <th className='px-5 py-3 font-semibold'>تاريخ التسجيل</th>
                <th aria-label='إجراءات' className='px-5 py-3 font-semibold' />
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className='px-5 py-14 text-center text-sm text-white/40'>
                    {search ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد مسجلون حتى الآن'}
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className='border-b border-white/5 transition hover:bg-white/[0.03]'>
                    <td className='px-5 py-3.5 font-bold text-white/90'>{r.full_name}</td>
                    <td className='px-5 py-3.5 text-white/60' dir='ltr'>
                      {r.email}
                    </td>
                    <td className='px-5 py-3.5 text-white/60' dir='ltr'>
                      {r.phone}
                    </td>
                    <td className='px-5 py-3.5 text-white/70'>{r.city}</td>
                    <td className='px-5 py-3.5 text-white/70'>{r.field}</td>
                    <td className='px-5 py-3.5'>
                      <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-bold ${EXPERIENCE_COLOR[r.experience]}`}>
                        {EXPERIENCE_LABEL[r.experience]}
                      </span>
                    </td>
                    <td className='px-5 py-3.5 text-[12px] text-white/50'>
                      {new Date(r.created_at).toLocaleDateString('ar', { day: 'numeric', month: 'long' })}
                    </td>
                    <td className='px-5 py-3.5'>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleteBusyId === r.id}
                        aria-label='حذف'
                        className='text-white/30 transition hover:text-red-400 disabled:opacity-40'
                        title='حذف'
                      >
                        <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                          <path d='M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v6M14 11v6' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Motivation expander */}
      {registrations.some((r) => r.motivation) && (
        <div className='mt-6 rounded-2xl border border-white/10 bg-[#0c0f1e]/70 p-5 backdrop-blur-md'>
          <h3 className='mb-4 text-sm font-extrabold'>دوافع المسجلين</h3>
          <div className='grid gap-3 md:grid-cols-2'>
            {registrations
              .filter((r) => r.motivation)
              .map((r) => (
                <div key={r.id} className='rounded-xl border border-white/10 bg-white/[0.03] p-4'>
                  <p className='mb-1.5 text-xs font-bold text-indigo-300'>{r.full_name}</p>
                  <p className='text-[13px] leading-relaxed text-white/65'>{r.motivation}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
