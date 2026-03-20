import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import { Button } from './components/ui/button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex flex-col items-center gap-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur relative">
          <img src={heroImg} className="h-40 w-40 object-contain" alt="Hero" />
          <div className="flex items-center gap-4">
            <img src={reactLogo} className="h-10 w-10" alt="React logo" />
            <img src={viteLogo} className="h-10 w-10" alt="Vite logo" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-cyan-400">Get started with Tailwind</h1>
            <p className="mt-2 text-slate-300">
              Edit <code className="rounded bg-slate-800 px-1 py-0.5">src/App.tsx</code> and save to
              test <code className="rounded bg-slate-800 px-1 py-0.5">HMR</code>
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button
              className="rounded-md border border-cyan-500 bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-cyan-500"
              onClick={() => setCount((c) => c + 1)}
            >
              Count is {count}
            </Button>
          </div>
        </section>

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-4 text-xl font-bold">Documentation</h2>
            <p className="mb-4 text-slate-300">Your questions, answered</p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://vite.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-cyan-700/40"
                >
                  <img className="h-5 w-5" src={viteLogo} alt="Vite" />
                  Explore Vite
                </a>
              </li>
              <li>
                <a
                  href="https://react.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-cyan-700/40"
                >
                  <img className="h-5 w-5" src={reactLogo} alt="React" />
                  Learn more
                </a>
              </li>
            </ul>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="mb-4 text-xl font-bold">Connect with us</h2>
            <p className="mb-4 text-slate-300">Join the Vite community</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/vitejs/vite"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-cyan-700/40"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://chat.vite.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-cyan-700/40"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/vite_js"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-cyan-700/40"
                >
                  X.com
                </a>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/vite.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-cyan-700/40"
                >
                  Bluesky
                </a>
              </li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
