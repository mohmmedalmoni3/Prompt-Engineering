'use client';

import { useEffect, useState } from 'react';

// -------------------------------------------------------------------
// Types & constants
// -------------------------------------------------------------------

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface Errors {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  field?: string;
  experience?: string;
  consent?: string;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  field: string;
  experience: string;
  motivation: string;
  consent: boolean;
}

const INITIAL: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  field: '',
  experience: '',
  motivation: '',
  consent: false
};

const FIELDS = [
  {
    id: 'fullName' as const,
    label: 'الاسم الكامل',
    placeholder: 'مثال: أحمد العلي',
    type: 'text',
    autoComplete: 'name'
  },
  {
    id: 'email' as const,
    label: 'البريد الإلكتروني',
    placeholder: 'you@email.com',
    type: 'email',
    autoComplete: 'email'
  },
  {
    id: 'phone' as const,
    label: 'رقم الواتساب (الأردن)',
    placeholder: '07XXXXXXXX',
    type: 'tel',
    autoComplete: 'tel'
  }
];

const JORDAN_GOVERNORATES = [
  'عمان',
  'إربد',
  'الزرقاء',
  'البلقاء',
  'مأدبا',
  'الكرك',
  'الطفيلة',
  'معان',
  'العقبة',
  'جرش',
  'عجلون',
  'المفرق'
];

const FIELD_OPTIONS = [
  'طالب جامعي',
  'خريج',
  'مطور برمجيات',
  'مهندس ذكاء اصطناعي',
  'مسوّق رقمي',
  'كاتب محتوى',
  'مصمم',
  'ريادي أعمال',
  'أخرى'
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'مبتدئ', desc: 'لم أستخدم النماذج الذكية من قبل' },
  { value: 'intermediate', label: 'متوسط', desc: 'أستخدم ChatGPT بشكل بسيط' },
  { value: 'advanced', label: 'متقدم', desc: 'أكتب برومبتات معقدة وأدوات متقدمة' }
];

// -------------------------------------------------------------------
// Validation
// -------------------------------------------------------------------

function validate(v: FormValues): Errors {
  const e: Errors = {};

  if (!v.fullName.trim() || v.fullName.trim().length < 2) e.fullName = 'أدخل الاسم الكامل';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'أدخل بريداً صحيحاً';
  if (!/^(?:\+?962|0)7\d{8}$/.test(v.phone.trim())) e.phone = 'أدخل رقم أردني صحيح (07XXXXXXXX)';
  if (!v.city) e.city = 'اختر المحافظة';
  if (!v.field) e.field = 'اختر المجال';
  if (!v.experience) e.experience = 'اختر المستوى';
  if (!v.consent) e.consent = 'يجب الموافقة للمتابعة';

  return e;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function RegisterForm() {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<FormState>('idle');
  const [serverError, setServerError] = useState('');
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  // Check whether registration is currently open
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setIsOpen(data.open !== false))
      .catch(() => setIsOpen(true));
  }, []);

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key as keyof Errors]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Scroll to first error
      const first = document.getElementById(Object.keys(validationErrors)[0] as string);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setState('submitting');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          city: values.city.trim(),
          field: values.field,
          experience: values.experience,
          motivation: values.motivation.trim()
        })
      });

      if (res.status === 409) {
        setServerError('هذا البريد مسجل مسبقاً');
        setState('error');
        return;
      }

      if (res.status === 403) {
        setIsOpen(false);
        setState('idle');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setServerError(data?.error ?? 'حدث خطأ غير متوقع');
        setState('error');
        return;
      }

      setState('success');
    } catch {
      setServerError('تحقق من اتصال الإنترنت وحاول مرة أخرى');
      setState('error');
    }
  }

  // -----------------------------------------------------------------
  // Success screen
  // -----------------------------------------------------------------

  if (state === 'success') {
    return (
      <div className='pe-pop relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-[#0d1125] p-8 text-center shadow-2xl shadow-emerald-600/10'>
        <div className='relative mx-auto mb-6 flex h-20 w-20 items-center justify-center'>
          <div className='absolute inset-0 rounded-full bg-emerald-500/20 blur-xl' />
          <svg
            className='relative h-16 w-16'
            viewBox='0 0 64 64'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle
              cx='32'
              cy='32'
              r='30'
              stroke='rgb(16 185 129)'
              strokeWidth='3'
              strokeLinecap='round'
              strokeDasharray='189'
              strokeDashoffset='189'
              className='pe-check-path'
              style={{ strokeDasharray: '189', strokeDashoffset: '189' }}
            />
            <path
              d='M20 33l8 8 16-16'
              stroke='rgb(16 185 129)'
              strokeWidth='3.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeDasharray='40'
              strokeDashoffset='40'
              className='pe-check-path'
              style={{ strokeDasharray: '40', strokeDashoffset: '40', animationDelay: '0.5s' }}
            />
          </svg>
        </div>

        <h2 className='mb-2 text-2xl font-extrabold text-white'>تم التسجيل بنجاح</h2>
        <p className='mb-1 text-sm text-white/70'>
          شكرًا لك! اسمك مسجّل في ورشة{' '}
          <span className='font-bold text-emerald-300'>Prompt Engineering</span>
        </p>
        <p className='mb-8 text-xs text-white/50'>
          سنرسل لك تفاصيل الجلسة عبر البريد الإلكتروني
        </p>

        <button
          onClick={() => {
            setValues(INITIAL);
            setErrors({});
            setState('idle');
          }}
          className='rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white'
        >
          تسجيل شخص آخر
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Form
  // -----------------------------------------------------------------

  // Registration closed — show a notice instead of the form
  if (isOpen === false) {
    return (
      <div className='relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/25 bg-[#0c0f1e]/80 p-8 pt-9 text-center shadow-2xl shadow-black/40 backdrop-blur-xl'>
        <div className='relative mx-auto mb-6 flex h-16 w-16 items-center justify-center'>
          <div className='absolute inset-0 rounded-2xl bg-amber-500/15 blur-xl' />
          <div className='relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-amber-600/5'>
            <svg className='h-8 w-8 text-amber-300' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
              <rect x='4' y='11' width='16' height='10' rx='2' />
              <path d='M8 11V7a4 4 0 0 1 8 0v4' />
            </svg>
          </div>
        </div>

        <h2 className='mb-2 text-xl font-extrabold text-white'>التسجيل مغلق حالياً</h2>
        <p className='mx-auto mb-7 max-w-sm text-sm leading-relaxed text-white/60'>
          انتهى موعد التسجيل في ورشة{' '}
          <span className='font-bold text-amber-300'>Prompt Engineering</span>.
          تابعنا لمعرفة تاريخ الورشات القادمة.
        </p>

        <button
          type='button'
          className='inline-block cursor-default rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-semibold text-white/60 transition hover:border-amber-400/40 hover:text-white'
        >
          فريق TOPX
        </button>
      </div>
    );
  }

  // Still loading the open/closed state — subtle skeleton so nothing flashes
  if (isOpen === null) {
    return (
      <div className='relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f1e]/80 p-6 pt-8 shadow-2xl shadow-black/40 backdrop-blur-xl'>
        <div className='mx-auto mb-2 h-5 w-40 animate-pulse rounded-md bg-white/10' />
        <div className='mx-auto mb-7 h-3 w-56 animate-pulse rounded-md bg-white/5' />
        <div className='space-y-4'>
          <div className='h-11 animate-pulse rounded-xl bg-white/5' />
          <div className='h-11 animate-pulse rounded-xl bg-white/5' />
          <div className='h-11 animate-pulse rounded-xl bg-white/5' />
          <div className='h-11 animate-pulse rounded-xl bg-white/5' />
          <div className='h-11 animate-pulse rounded-xl bg-white/5' />
          <div className='h-12 animate-pulse rounded-xl bg-gradient-to-l from-[#3b5bdb]/40 to-[#7c3aed]/40' />
        </div>
      </div>
    );
  }

  return (
    <div className='relative w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-white/10 bg-[#0c0f1e]/80 p-6 pt-8 shadow-2xl shadow-black/40 backdrop-blur-xl'>
      <h2 className='mb-1 text-center text-lg font-extrabold'>سجّل الآن مجاناً</h2>
      <p className='mb-7 text-center text-xs text-white/45'>
        أكمل النموذج بالبيانات التالية — أقل من دقيقة
      </p>

      {state === 'error' && serverError && (
        <div className='mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-200'>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className='space-y-4'>
        {/* Basic fields */}
        {FIELDS.map((f) => (
          <Field
            key={f.id}
            id={f.id}
            label={f.label}
            placeholder={f.placeholder}
            type={f.type}
            autoComplete={f.autoComplete}
            value={values[f.id] as string}
            error={errors[f.id as keyof Errors]}
            onChange={(v) => set(f.id, v)}
          />
        ))}

        {/* City — Jordanian governorates */}
        <div>
          <label htmlFor='city' className='mb-1.5 block text-xs font-semibold text-white/65'>
            المحافظة
          </label>
          <select
            id='city'
            value={values.city}
            onChange={(e) => set('city', e.target.value)}
            className={`w-full appearance-none rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/30 ${
              errors.city ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <option value='' disabled className='bg-[#0c0f1e] text-white/40'>
              اختر محافظتك
            </option>
            {JORDAN_GOVERNORATES.map((g) => (
              <option key={g} value={g} className='bg-[#0c0f1e] text-white'>
                {g}
              </option>
            ))}
          </select>
          {errors.city && <ErrorText>{errors.city}</ErrorText>}
        </div>

        {/* Field */}
        <div>
          <label htmlFor='field' className='mb-1.5 block text-xs font-semibold text-white/65'>
            المجال / المهنة
          </label>
          <select
            id='field'
            value={values.field}
            onChange={(e) => set('field', e.target.value)}
            className={`peer w-full appearance-none rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/30 ${
              errors.field ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <option value='' disabled className='bg-[#0c0f1e] text-white/40'>
              اختر مجالك
            </option>
            {FIELD_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className='bg-[#0c0f1e] text-white'>
                {opt}
              </option>
            ))}
          </select>
          {errors.field && <ErrorText>{errors.field}</ErrorText>}
        </div>

        {/* Experience */}
        <fieldset>
          <legend className='mb-2 block text-xs font-semibold text-white/65'>
            مستوى الخبرة بالبرومبتينج
          </legend>
          <div className='grid grid-cols-3 gap-2'>
            {EXPERIENCE_OPTIONS.map((opt) => {
              const active = values.experience === opt.value;
              const hasError = !!errors.experience;
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => set('experience', opt.value)}
                  className={`relative rounded-xl border px-2 py-3 text-center transition ${
                    active
                      ? 'border-[#4f46e5] bg-[#4f46e5]/15 shadow-lg shadow-[#4f46e5]/10'
                      : hasError
                        ? 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  {active && (
                    <span className='absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4f46e5] text-[9px]'>
                      ✓
                    </span>
                  )}
                  <span className={`block text-sm font-bold ${active ? 'text-indigo-200' : 'text-white/80'}`}>
                    {opt.label}
                  </span>
                  <span className='mt-1 block text-[10px] leading-tight text-white/45'>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.experience && <ErrorText>{errors.experience}</ErrorText>}
        </fieldset>

        {/* Motivation */}
        <div>
          <label htmlFor='motivation' className='mb-1.5 block text-xs font-semibold text-white/65'>
            لماذا تريد الانضمام؟ <span className='text-white/30'>(اختياري)</span>
          </label>
          <textarea
            id='motivation'
            value={values.motivation}
            onChange={(e) => set('motivation', e.target.value)}
            rows={3}
            placeholder='أخبرنا عن استخداماتك المتوقعة...'
            className='w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 hover:border-white/20 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/30'
          />
        </div>

        {/* Consent */}
        <label className='flex cursor-pointer items-start gap-3'>
          <span className='relative mt-0.5'>
            <input
              type='checkbox'
              checked={values.consent}
              onChange={(e) => set('consent', e.target.checked)}
              className='peer sr-only'
            />
            <span className='flex h-[18px] w-[18px] items-center justify-center rounded-md border border-white/20 bg-white/5 transition peer-checked:border-[#4f46e5] peer-checked:bg-[#4f46e5]'>
              {values.consent && (
                <svg className='h-3 w-3 text-white' viewBox='0 0 12 12' fill='none'>
                  <path
                    d='M2.5 6l2.5 2.5 4.5-5'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </span>
          </span>
          <span className='text-[11px] leading-relaxed text-white/55'>
            أوافق على مشاركة بياناتي للتسجيل في الورشة
          </span>
        </label>
        {errors.consent && <ErrorText>{errors.consent}</ErrorText>}

        {/* Submit */}
        <button
          type='submit'
          disabled={state === 'submitting'}
          className='relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-l from-[#3b5bdb] to-[#7c3aed] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#4f46e5]/25 transition hover:brightness-110 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:hover:brightness-100'
        >
          {state === 'submitting' ? (
            <span className='inline-flex items-center gap-2'>
              <svg
                className='h-4 w-4 animate-spin'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' strokeDasharray='50' strokeDashoffset='15' />
              </svg>
              جاري التسجيل...
            </span>
          ) : (
            'سجّل الآن مجاناً'
          )}
        </button>

        <p className='text-center text-[10px] text-white/30'>
          يمكنك إلغاء التسجيل في أي وقت عبر البريد الإلكتروني
        </p>
      </form>
    </div>
  );
}

// -------------------------------------------------------------------
// Shared field + error
// -------------------------------------------------------------------

function Field({
  id,
  label,
  placeholder,
  type,
  autoComplete,
  value,
  error,
  onChange
}: {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  autoComplete?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className='mb-1.5 block text-xs font-semibold text-white/65'>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/30 ${
          error ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'
        }`}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <span className='mt-1.5 block text-[11px] font-medium text-red-400' role='alert'>
      {children}
    </span>
  );
}