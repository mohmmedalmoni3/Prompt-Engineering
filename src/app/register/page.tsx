import { Tajawal } from 'next/font/google';
import type { Metadata } from 'next';
import RegisterForm from './register-form';

export const metadata: Metadata = {
  title: 'تسجيل في ورشة Prompt Engineering المجانية',
  description:
    'سجّل الآن في ورشة Prompt Engineering المجانية واحترف هندسة الأوامر للنماذج الذكية مثل ChatGPT و Claude.'
};

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal'
});

export default function RegisterPage() {
  return (
    <div
      dir='rtl'
      className={`${tajawal.variable} relative min-h-screen overflow-hidden bg-[#07070f] text-white`}
      style={{ fontFamily: 'var(--font-tajawal), "Segoe UI", Tahoma, sans-serif' }}
    >
      {/* ===== Ambient background (calmer — no moving particles) ===== */}
      <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,#18214d_0%,#07070f_55%,#07070f_100%)]' />
        <div className='pe-orb absolute -top-40 -right-40 h-[460px] w-[460px] rounded-full bg-[#4f46e5]/20 blur-[140px]' />
        <div className='pe-orb absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-[#7c3aed]/20 blur-[150px] [animation-delay:5s]' />
      </div>

      {/* ===== Top bar ===== */}
      <header className='relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8'>
        <div className='flex items-center gap-3'>
          <div className='relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#6366f1]/50 bg-[#0d1125] shadow-lg shadow-[#4f46e5]/25'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#4f46e5]/45 via-[#312e81]/20 to-[#7c3aed]/45' />
            <span className='relative text-sm font-extrabold tracking-tight'>
              <span className='bg-gradient-to-br from-white via-[#a5b4fc] to-[#c4b5fd] bg-clip-text text-transparent'>
                TOP
              </span>
              <span className='bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent'>
                X
              </span>
            </span>
          </div>
          <div className='leading-tight'>
            <p className='text-sm font-bold'>Prompt Engineering</p>
            <p className='text-[11px] text-white/50'>ورشة مجانية · عربية</p>
          </div>
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className='relative z-10 mx-auto max-w-7xl px-5 pb-16 lg:px-8'>
        {/* Mobile intro (small) */}
        <div className='mb-6 text-center lg:hidden'>
          <h1 className='text-2xl font-extrabold leading-tight'>
            <span className='bg-gradient-to-l from-blue-200 via-purple-300 to-indigo-300 bg-clip-text text-transparent'>
              أتقن هندسة الأوامر للنماذج الذكية
            </span>
          </h1>
          <p className='mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60'>
            انضم للورشة المجانية واكتب أوامر احترافية تجعل ChatGPT و Claude يعملان لصالحك.
          </p>
        </div>

        <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-10'>
          {/* ---------- Promo panel (desktop only) ---------- */}
          <section className='hidden lg:block'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-[#4f46e5]/30 bg-[#4f46e5]/10 px-4 py-1.5 text-xs font-semibold text-indigo-200'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-400' />
              </span>
              التسجيل متاح الآن · الأماكن محدودة
            </div>

            <h1 className='text-4xl font-extrabold leading-[1.15] lg:text-5xl'>
              <span className='bg-gradient-to-l from-blue-200 via-purple-300 to-indigo-300 bg-clip-text text-transparent'>
                أتقن هندسة الأوامر
              </span>
              <br />
              للنماذج الذكية
            </h1>

            <p className='mt-5 max-w-xl text-base leading-relaxed text-white/70'>
              انضم إلى الورشة المجانية{' '}
              <span className='font-bold text-white'>Prompt Engineering</span> وتعلّم كيف تكتب
              أوامر احترافية تجعل ChatGPT و Claude يعملان لصالحك — في عملك ودراستك ومشاريعك.
            </p>

            <div className='mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60'>
              🎓 شهادة مشاركة · 🎥 جلسة مباشرة · 🔥 عدد محدود · 💻 عبر الإنترنت
            </div>
          </section>

          {/* ---------- Form (shown first on mobile) ---------- */}
          <RegisterForm />
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className='relative z-10 border-t border-white/5 py-6 text-center text-xs text-white/35'>
        <p>
          © {new Date().getFullYear()} ورشة Prompt Engineering المجانية — جميع الحقوق محفوظة
        </p>
        <p className='mt-2 text-[11px] font-bold tracking-tight'>
          <span className='bg-gradient-to-r from-[#a5b4fc] to-[#a78bfa] bg-clip-text text-transparent'>
            TOPX
          </span>
          <span className='text-white/25'> · من تقديم فريق TopX</span>
        </p>
      </footer>

      {/* ===== Ambient animation ===== */}
      <style>{`
        @keyframes pe-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(1.05); }
        }
        .pe-orb {
          animation: pe-float 11s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}