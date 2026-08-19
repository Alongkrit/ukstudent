import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';

export const metadata: Metadata = {
  title: 'Scholza — Connect with Academic Experts in Minutes',
  description: 'On-demand personalised academic guidance for university students worldwide across assignments, dissertations, exam prep, proofreading, and programming.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
                <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=GBP`}
          strategy="afterInteractive"
        />
        <AuthProvider>
          <Navbar />
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
          <BottomNav />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}