import { Tajawal } from 'next/font/google';
import Link from 'next/link';
import type { Metadata } from 'next';
import AdminClient from './admin-client';

export const metadata: Metadata = {
  title: 'لوحة إدارة الورشة',
  description: 'لوحة تحكم خاصة بإدارة المسجلين في ورشة Prompt Engineering'
};

const tajawal = Tajawal({
  subsets: ['latin', 'arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal'
});

export default function AdminPage() {
  return (
    <div
      dir='rtl'
      className={`${tajawal.variable} relative min-h-screen bg-[#07070f] text-white`}
      style={{ fontFamily: 'var(--font-tajawal), "Segoe UI", Tahoma, sans-serif' }}
    >
      <div className='pointer-events-none fixed inset-0 opacity-60' aria-hidden='true'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,#141a3a_0%,#07070f_60%)]' />
        <div className='absolute -top-40 left-1/3 h-[380px] w-[380px] rounded-full bg-[#4f46e5]/15 blur-[130px]' />
      </div>

      <div className='relative z-10 mx-auto max-w-7xl px-5 py-10 lg:px-8'>
        <div className='mb-8 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b5bdb] to-[#7c3aed] text-base font-extrabold shadow-lg shadow-[#4f46e5]/25'>
              TOPX
            </div>
            <div className='leading-tight'>
              <h1 className='text-lg font-extrabold'>لوحة إدارة الورشة</h1>
              <p className='text-xs text-white/45'>Prompt Engineering · تسجيلات الورشة</p>
            </div>
          </div>
          <Link
            href='/register'
            className='rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/60 transition hover:border-[#4f46e5]/40 hover:text-white'
          >
            → صفحة التسجيل
          </Link>
        </div>

        <AdminClient />
      </div>
    </div>
  );
}