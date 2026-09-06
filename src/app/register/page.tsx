import { Tajawal } from 'next/font/google';
import Link from 'next/link';
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

const topics = [
  'أساسيات هندسة الأوامر (Prompt Engineering)',
  'تقنيات Zero-Shot و Few-Shot و Chain-of-Thought',
  'تحسين نتائج ChatGPT و Claude باحترافية',
  'بناء مساعدات ذكية ووكلاء (Agents) بسيطة',
  'مشاريع عملية وتطبيقات حقيقية من الصفر'
];

const slots = [
  { label: 'شهادة مشاركة', icon: '🎓' },
  { label: 'جلسة مباشرة', icon: '🎥' },
  { label: 'عدد محدود', icon: '🔥' },
  { label: 'مريحة عبر الإنترنت', icon: '💻' }
];

// Deterministic floating particles (rendered once on the server)
const particles = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + ((i * 7) % 4),
  delay: (i % 10) * 0.8,
  duration: 8 + ((i * 3) % 8)
}));

export default function RegisterPage() {
  return (
    <div
      dir='rtl'
      className={`${tajawal.variable} relative min-h-screen overflow-hidden bg-[#07070f] text-white`}
      style={{ fontFamily: 'var(--font-tajawal), "Segoe UI", Tahoma, sans-serif' }}
    >
      {/* ===== Ambient background ===== */}
      <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,#18214d_0%,#07070f_55%,#07070f_100%)]' />
        <div className='pe-orb absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#4f46e5]/25 blur-[140px]' />
        <div className='pe-orb absolute top-1/3 -left-40 h-[460px] w-[460px] rounded-full bg-[#2563eb]/20 blur-[150px] [animation-delay:3s]' />
        <div className='pe-orb absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full bg-[#7c3aed]/20 blur-[150px] [animation-delay:6s]' />
        <div
          className='absolute inset-0 opacity-[0.16]'
          style={{
            backgroundImage:
              'linear-gradient(rgba(79,70,229,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.25) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)'
          }}
        />
        <div className='absolute inset-0 overflow-hidden'>
          {particles.map((p) => (
            <span
              key={p.id}
              className='pe-particle absolute rounded-full bg-[#818cf8]/40'
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== Top bar ===== */}
      <header className='relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          {/* Custom TOPX logo mark */}
          <div className='relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#6366f1]/50 bg-[#0d1125] shadow-lg shadow-[#4f46e5]/30'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#4f46e5]/45 via-[#312e81]/20 to-[#7c3aed]/45' />
            <div className='absolute -right-2 -top-3 h-6 w-6 rounded-full bg-[#818cf8]/30 blur-md' />
            <div className='absolute -bottom-3 -left-2 h-6 w-6 rounded-full bg-[#a78bfa]/25 blur-md' />
            <span className='relative text-[15px] font-extrabold tracking-tight'>
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
        <Link
          href='/admin'
          className='rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/60 transition hover:border-[#4f46e5]/40 hover:text-white'
        >
          لوحة الإدارة
        </Link>
      </header>

      {/* ===== Hero + Form ===== */}
      <main className='relative z-10 mx-auto max-w-7xl px-5 pb-20 lg:px-8'>
        <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-10'>
          {/* ---------- Promo panel ---------- */}
          <section>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-[#4f46e5]/30 bg-[#4f46e5]/10 px-4 py-1.5 text-xs font-semibold text-indigo-200'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-400' />
              </span>
              التسجيل متاح الآن · الأماكن محدودة
            </div>

            <h1 className='text-4xl font-extrabold leading-[1.2] sm:text-5xl lg:text-[3.4rem]'>
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

            <div className='mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md'>
              <p className='mb-4 text-sm font-bold text-white/90'>سنتعلم معاً</p>
              <ul className='space-y-3'>
                {topics.map((topic, i) => (
                  <li key={topic} className='flex items-start gap-3 text-sm text-white/75'>
                    <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3b5bdb] to-[#7c3aed] text-[10px] font-bold'>
                      ✓
                    </span>
                    <span>
                      <span className='ml-1 font-bold text-indigo-300'>{i + 1}.</span> {topic}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4'>
              {slots.map((s) => (
                <div
                  key={s.label}
                  className='flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3.5 text-center'
                >
                  <span className='text-xl'>{s.icon}</span>
                  <span className='text-[11px] font-semibold text-white/70'>{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- Form ---------- */}
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

      {/* ===== Ambient animations ===== */}
      <style>{`
        @keyframes pe-float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-18px) scale(1.05);
          }
        }
        .pe-orb {
          animation: pe-float 11s ease-in-out infinite;
        }
        @keyframes pe-rise {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          12% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-130vh);
            opacity: 0;
          }
        }
        .pe-particle {
          animation-name: pe-rise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes pe-pop {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          60% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .pe-pop {
          animation: pe-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes pe-check {
          to {
            stroke-dashoffset: 0;
          }
        }
        .pe-check-path {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: pe-check 0.7s ease-out 0.25s forwards;
        }
      `}</style>
    </div>
  );
}