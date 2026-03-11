/**
 * app.js - Refactored with the new Tailwind UI components.
 */

(function () {
  'use strict';

  let currentUser = null;
  const $app = () => document.getElementById('app');

  const routes = [
    { path: /^\/$/, handler: page_dashboard, auth: true },
    { path: /^\/practice\/?$/, handler: page_practice, auth: true },
    { path: /^\/login\/?$/, handler: page_login },
    { path: /^\/register\/?$/, handler: page_register },
    { path: /^\/dashboard\/?$/, handler: page_dashboard, auth: true },
    { path: /^\/profile\/?$/, handler: page_profile, auth: true },
    { path: /^\/manage\/?$/, handler: page_admin, auth: true, admin: true },
    { path: /^\/manage\/create\/?$/, handler: page_adminCreate, auth: true, admin: true },
    { path: /^\/manage\/edit\/(\d+)\/?$/, handler: page_adminEdit, auth: true, admin: true },
    { path: /^\/lang\/([a-z0-9-]+)\/?$/, handler: page_language, auth: true },
    { path: /^\/lang\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/, handler: page_lesson, auth: true },
  ];

  function getHash() { return window.location.hash.slice(1) || '/'; }
  function navigate(path) { window.location.hash = '#' + path; }

  async function router() {
    const p = getHash();
    if (!currentUser) {
      try { currentUser = await Api.me(); } catch { currentUser = null; }
    }

    for (const route of routes) {
      const match = p.match(route.path);
      if (match) {
        if (route.auth && !currentUser) {
          if (p === '/' || p === '/dashboard') {
            window.location.href = 'index.html';
          } else {
            navigate('/login');
          }
          return;
        }
        if (route.admin && !currentUser?.is_superuser) { navigate('/'); return; }

        $app().innerHTML = '<div class="loader-wrap w-full"><div class="loader"></div></div>';
        try {
          await route.handler(...match.slice(1));
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            currentUser = null; navigate('/login');
          } else {
            $app().innerHTML = `<div class="flex flex-col items-center justify-center py-20"><span class="material-symbols-outlined text-6xl text-slate-300">error</span><h2 class="text-xl mt-4">Oops!</h2><p class="text-slate-500">${err.message}</p></div>`;
          }
        }
        window.scrollTo(0, 0);
        return;
      }
    }
    $app().innerHTML = '<div class="flex flex-col items-center justify-center py-20"><span class="material-symbols-outlined text-6xl text-slate-300">map</span><h2 class="text-xl mt-4">Not Found</h2><a href="#/" class="text-primary font-bold mt-4">Go Home</a></div>';
  }

  function isActive(path) {
    return getHash() === path || getHash().startsWith(path + '/') ? 'active text-primary' : 'text-slate-400 dark:text-slate-500';
  }
  function isIconActive(path) {
    return getHash() === path || getHash().startsWith(path + '/') ? 'fill' : '';
  }

  function renderTopNav() {
    if (!currentUser) return '';
    return `
    <nav class="hidden md:flex items-center bg-white dark:bg-slate-900 px-6 py-4 justify-between border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div class="flex items-center gap-2 cursor-pointer" onclick="App.navigate('/')">
        <span class="material-symbols-outlined text-primary text-3xl">terminal</span>
        <h2 class="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">CodeLearn</h2>
      </div>
      <div class="flex items-center gap-6">
        <a class="${getHash() === '/' || getHash().startsWith('/dashboard') || getHash().startsWith('/lang') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'} text-sm font-semibold transition-colors" href="#/">Home</a>
        <a class="${getHash().startsWith('/practice') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'} text-sm font-semibold transition-colors" href="#/practice">Practice</a>
        ${currentUser.is_superuser ? `
        <a class="${getHash().startsWith('/manage') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'} text-sm font-semibold transition-colors" href="#/manage">Manage</a>
        ` : ''}
        <a class="${getHash().startsWith('/profile') ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'} text-sm font-semibold transition-colors flex items-center gap-2" href="#/profile">
          <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-[20px] ${getHash().startsWith('/profile') ? 'fill-[1]' : ''}">person</span>
          </div>
        </a>
      </div>
    </nav>
    `;
  }

  function renderBottomNav() {
    if (!currentUser) return '';
    return `
    <nav class="md:hidden sticky bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pb-3 pt-2 mt-auto z-[60]">
      <div class="flex justify-around items-center max-w-md mx-auto">
        <a class="flex flex-col items-center gap-1 ${getHash() === '/' || getHash().startsWith('/dashboard') || getHash().startsWith('/lang') ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}" href="#/">
          <span class="material-symbols-outlined text-2xl ${getHash() === '/' || getHash().startsWith('/dashboard') || getHash().startsWith('/lang') ? 'fill-[1]' : ''}">home</span>
        </a>
        <a class="flex flex-col items-center gap-1 ${getHash().startsWith('/practice') ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}" href="#/practice">
          <span class="material-symbols-outlined text-2xl ${getHash().startsWith('/practice') ? 'fill-[1]' : ''}">menu_book</span>
        </a>
        ${currentUser && currentUser.is_superuser ? `
        <a class="flex flex-col items-center gap-1 ${getHash().startsWith('/manage') ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}" href="#/manage">
          <span class="material-symbols-outlined text-2xl ${getHash().startsWith('/manage') ? 'fill-[1]' : ''}">build</span>
        </a>
        ` : ''}
        <a class="flex flex-col items-center gap-1 ${getHash().startsWith('/profile') ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}" href="#/profile">
          <span class="material-symbols-outlined text-2xl ${getHash().startsWith('/profile') ? 'fill-[1]' : ''}">person</span>
        </a>
      </div>
    </nav>
    `;
  }

  function toast(msg, type='info') {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info');
    el.innerHTML = `<span class="material-symbols-outlined">${icon}</span> <span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s forwards';
      setTimeout(()=>el.remove(), 300);
    }, 3000);
  }

  const escapeHTML = str => {
    let d = document.createElement('div');
    d.textContent = str; return d.innerHTML;
  };

  // ═════════════════════════════
  // Views
  // ═════════════════════════════

  async function page_practice() {
    $app().innerHTML = `
      ${renderTopNav()}
      <header class="md:hidden flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 w-full">
          <h2 class="text-lg font-bold leading-tight flex-1">Compiler Sandbox</h2>
      </header>
      <main class="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full pb-20 overflow-y-auto">
          <div class="flex items-center gap-4 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div class="flex-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Language</label>
                  <select id="compLang" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary font-bold">
                      <option value="python">Python 3</option>
                      <option value="html">HTML & UI</option>
                      <option value="javascript">JavaScript</option>
                      <option value="cpp">C++ (GCC)</option>
                  </select>
              </div>
              <div class="pt-5">
                  <button id="runBtn" class="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-colors">
                      <span class="material-symbols-outlined">play_arrow</span> Run
                  </button>
              </div>
          </div>
          
          <div class="flex-1 flex flex-col gap-4">
              <div class="flex flex-col flex-1 min-h-[250px] relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div class="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center">
                     <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Editor</span>
                  </div>
                  <textarea id="compCode" class="w-full flex-1 bg-[#1e1e1e] text-emerald-400 font-mono text-sm p-4 outline-none resize-none border-none" spellcheck="false"></textarea>
              </div>
              
              <div class="flex flex-col h-48 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div class="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between">
                     <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Output Terminal</span>
                     <button id="clrBtn" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold uppercase underline">Clear</button>
                  </div>
                  <div id="compOutput" class="w-full flex-1 bg-white dark:bg-[#0d1117] p-3 font-mono text-sm overflow-auto text-slate-800 dark:text-slate-300"></div>
              </div>
          </div>
      </main>
      ${renderBottomNav()}
    `;

    const defCode = {
      python: 'print("Hello from Python!")',
      cpp: '#include <iostream>',
      javascript: 'console.log("Hello from JavaScript!");',
      html: '<h1>Hello World</h1>'
    };

    const sel = document.getElementById('compLang');
    const tb = document.getElementById('compCode');
    const out = document.getElementById('compOutput');
    const btn = document.getElementById('runBtn');
    
    // Init Default
    tb.value = defCode.python;

    sel.addEventListener('change', () => {
      tb.value = defCode[sel.value];
      out.innerHTML = '';
    });
    
    document.getElementById('clrBtn').addEventListener('click', () => {
        out.innerHTML = '';
    });

    btn.addEventListener('click', async () => {
      const lang = sel.value;
      const code = tb.value;
      
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span> Running...';
      out.innerHTML = '';

      try {
          if (lang === 'html') {
              const f = document.createElement('iframe');
              f.className = 'w-full h-full border-none bg-white';
              f.srcdoc = code;
              out.appendChild(f);
          } else if (lang === 'javascript') {
              let logs = '';
              const origLog = console.log, origErr = console.error;
              console.log = (...a) => { logs += a.join(' ') + '\\n'; };
              console.error = (...a) => { logs += 'ERR: ' + a.join(' ') + '\\n'; };
              try { new Function(code)(); } catch(e) { logs += e.toString(); }
              console.log = origLog; console.error = origErr;
              out.textContent = logs || 'Finished without output.';
          } else {
              out.innerHTML = '<span class="text-slate-400">Compiling on remote Wandbox server...</span>\\n';
              
              let compiler = '';
              if (lang === 'python') { compiler = 'cpython-3.10.15'; }
              if (lang === 'cpp') { compiler = 'gcc-13.2.0'; }
              
              const res = await fetch('https://wandbox.org/api/compile.json', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      compiler: compiler,
                      code: code,
                      save: false
                  })
              });
              const data = await res.json();
              
              let outStr = '';
              if (data.compiler_error) { outStr += 'Compiler Error:\\n' + data.compiler_error + '\\n'; }
              if (data.program_message) { outStr += data.program_message; }
              if (!outStr && data.status === '0') { outStr = 'Success with no output.'; }
              else if (!outStr && data.status !== '0') { outStr = 'Exited with status ' + data.status; }
              
              out.textContent = outStr;
          }
      } catch (err) {
          out.textContent = 'Network or Execution Error:\\n' + err.message;
      }
      
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">play_arrow</span> Run';
    });
  }

  async function page_login() {
    $app().innerHTML = `
      <header class="flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
          <button onclick="window.location.href='index.html'" class="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 class="text-lg font-bold leading-tight flex-1 text-center pr-10">Log In</h2>
      </header>
      <main class="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <div class="w-full max-w-md">
              <div class="flex justify-center mb-8">
                  <div class="bg-primary/10 dark:bg-primary/20 p-4 rounded-xl">
                      <span class="material-symbols-outlined text-primary text-5xl">terminal</span>
                  </div>
              </div>
              <div class="text-center mb-10">
                  <h1 class="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight mb-2">Welcome Back</h1>
                  <p class="text-slate-600 dark:text-slate-400 text-base font-normal">Log in to continue your coding journey</p>
              </div>
              <form id="lFrm" class="space-y-5">
                  <div class="flex flex-col gap-2">
                      <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold">Username</label>
                      <div class="relative">
                          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                          <input id="lUser" class="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-0 focus:border-primary transition-colors outline-none" placeholder="Your username" type="text" required/>
                      </div>
                  </div>
                  <div class="flex flex-col gap-2">
                      <div class="flex justify-between items-center">
                          <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold">Password</label>
                      </div>
                      <div class="relative">
                          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                          <input id="lPass" class="w-full pl-12 pr-12 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-0 focus:border-primary transition-colors outline-none" placeholder="••••••••" type="password" required/>
                      </div>
                  </div>
                  <button class="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary/90 transition-colors mt-4" type="submit">
                      Log In
                  </button>
              </form>
              <p class="text-center text-slate-600 dark:text-slate-400 mt-8">
                  Don't have an account? 
                  <a href="#/register" class="text-primary font-bold hover:underline">Sign Up</a>
              </p>
          </div>
      </main>
      ${renderBottomNav()}
    `;
    document.getElementById('lFrm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await Api.login({ username: lUser.value, password: lPass.value });
        currentUser = res.user;
        if(currentUser.profile?.theme) {
          if(currentUser.profile.theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', currentUser.profile.theme);
        }
        toast('Logged in!', 'success'); navigate('/dashboard');
      } catch (err) { toast(err.data?.error || 'Login failed', 'error'); }
    };
  }

  async function page_register() {
    $app().innerHTML = `
      <header class="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
          <div onclick="window.location.href='index.html'" class="text-primary flex size-12 shrink-0 items-center justify-start cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
              <span class="material-symbols-outlined text-2xl">arrow_back</span>
          </div>
          <h2 class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Sign Up</h2>
      </header>
      <main class="flex-1 flex flex-col items-center px-4 w-full max-w-[480px] mx-auto overflow-y-auto">
          <div class="w-full pt-6 pb-3 text-center">
              <div class="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                  <span class="material-symbols-outlined text-primary text-4xl">code</span>
              </div>
              <h1 class="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-bold leading-tight">Create Account</h1>
              <p class="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal pt-2">Join the Learn to Code community today</p>
          </div>
          <form id="rFrm" class="w-full space-y-4 mt-4">
              <div class="flex flex-col gap-2">
                  <label class="flex flex-col w-full">
                      <p class="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-1">Username</p>
                      <input id="rU" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/5 dark:bg-primary/10 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-base font-normal" placeholder="Enter username" type="text" required/>
                  </label>
              </div>
              <div class="flex flex-col gap-2">
                  <label class="flex flex-col w-full">
                      <p class="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-1">Email</p>
                      <input id="rE" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/5 dark:bg-primary/10 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-base font-normal" placeholder="example@email.com" type="email" required/>
                  </label>
              </div>
              <div class="flex flex-col gap-2">
                  <label class="flex flex-col w-full">
                      <p class="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-1">Password</p>
                      <input id="rP1" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/5 dark:bg-primary/10 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-base font-normal" placeholder="Create a strong password" type="password" required minlength="8"/>
                  </label>
              </div>
              <div class="flex flex-col gap-2">
                  <label class="flex flex-col w-full">
                      <p class="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal pb-1">Confirm Password</p>
                      <input id="rP2" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-primary/5 dark:bg-primary/10 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-4 text-base font-normal" placeholder="Confirm your password" type="password" required minlength="8"/>
                  </label>
              </div>
              <div class="pt-4">
                  <button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2" type="submit">
                      Sign Up
                  </button>
              </div>
          </form>
          <div class="mt-8 text-center pb-12 w-full">
              <div class="mt-4 border-t border-primary/10 pt-8">
                  <p class="text-slate-900 dark:text-slate-100 font-normal">
                      Already have an account? 
                      <a href="#/login" class="text-primary font-bold hover:underline ml-1">Log In</a>
                  </p>
              </div>
          </div>
      </main>
      ${renderBottomNav()}
    `;
    document.getElementById('rFrm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await Api.register({ username:rU.value, email:rE.value, password:rP1.value, password2:rP2.value });
        currentUser = res.user; toast('Account Created!', 'success'); navigate('/dashboard');
      } catch (err) { toast('Registration failed', 'error'); }
    }
  }

  async function page_dashboard() {
    const langs = await Api.getDashboard();
    
    const ordering = ['python', 'html', 'javascript', 'cpp'];
    langs.sort((a, b) => {
      let aIdx = ordering.indexOf(a.slug);
      let bIdx = ordering.indexOf(b.slug);
      if (aIdx === -1) aIdx = 999;
      if (bIdx === -1) bIdx = 999;
      return aIdx - bIdx;
    });
    
    let activeCourse = langs.find(l => l.progress_pct > 0 && l.progress_pct < 100) || langs[0];
    let topBannerHtml = '';
    
    if (activeCourse) {
      topBannerHtml = `
          <div class="bg-primary relative overflow-hidden rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg cursor-pointer hover:shadow-primary/30 transition-shadow z-0" onclick="App.navigate('/lang/${activeCourse.slug}')">
              <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <span class="text-primary-100 font-bold uppercase tracking-wider text-xs mb-2 block text-white/80">Continue Learning</span>
                    <h2 class="text-3xl md:text-4xl font-black mb-2">${escapeHTML(activeCourse.name)}</h2>
                    <p class="text-white/90 text-sm md:text-base max-w-md">${activeCourse.completed_count} of ${activeCourse.lesson_count} lessons completed.</p>
                 </div>
                 <div class="flex-shrink-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                     <div class="flex items-center gap-4">
                         <div class="relative w-16 h-16 flex items-center justify-center">
                             <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                                 <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="6" fill="none" class="text-white/20"/>
                                 <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="6" fill="none" stroke-dasharray="175" stroke-dashoffset="${175 - (175 * activeCourse.progress_pct) / 100}"/>
                             </svg>
                             <span class="font-bold relative z-10">${activeCourse.progress_pct}%</span>
                         </div>
                         <button class="bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors">Resume</button>
                     </div>
                 </div>
              </div>
              <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none transform rotate-12 scale-150">
                  <span class="material-symbols-outlined text-[200px]">${activeCourse.icon}</span>
              </div>
          </div>
      `;
    }

    let html = '';
    if (!langs.length) {
      html = `<div class="flex flex-col items-center justify-center p-12 text-center text-slate-500 col-span-full"><span class="material-symbols-outlined text-6xl mb-4">book</span><h3>No Courses</h3><p>Nothing here yet.</p></div>`;
    } else {
      html = langs.map(l => `
        <div class="flex flex-col gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:border-primary hover:-translate-y-1 transition-all" onclick="App.navigate('/lang/${l.slug}')">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style="background:${l.color}15; color:${l.color};">
                  ${l.icon}
                </div>
                <div>
                  <h3 class="text-slate-900 dark:text-white font-bold text-lg">${escapeHTML(l.name)}</h3>
                  <p class="text-slate-500 text-sm">${l.completed_count}/${l.lesson_count} lessons</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-slate-300">chevron_right</span>
            </div>
            <div class="rounded-full bg-slate-100 dark:bg-slate-800 h-2 mt-2 overflow-hidden">
                <div class="h-full bg-primary transition-all duration-500" style="width: ${l.progress_pct}%;"></div>
            </div>
        </div>
      `).join('');
    }

    $app().innerHTML = `
      ${renderTopNav()}
      <header class="md:hidden flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 w-full">
           <span class="material-symbols-outlined text-primary text-3xl">terminal</span>
      <h2 class="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">CodeLearn</h2>
      </header>
      <main class="flex-1 overflow-y-auto px-4 py-6 md:py-10 w-full max-w-5xl mx-auto">
          ${topBannerHtml}
          <div class="flex items-center justify-between mb-6">
              <h2 class="text-slate-900 dark:text-white text-xl md:text-2xl font-bold">Explore Courses</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${html}
          </div>
      </main>
      ${renderBottomNav()}
    `;
  }

  async function page_language(slug) {
    const data = await Api.getLanguageLessons(slug);
    const { language: lang, lessons: ls, total, completed_count: cc, progress_pct: pct } = data;

    const list = ls.map(l => `
      <div onclick="App.navigate('/lang/${slug}/${l.slug}')" class="flex flex-col p-4 rounded-xl border ${l.is_completed ? 'border-primary/30 bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} cursor-pointer hover:border-primary transition-colors">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${l.is_completed ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
              ${l.is_completed ? '<span class="material-symbols-outlined text-xl">check</span>' : l.sequence}
            </div>
            <div>
              <h4 class="text-slate-900 dark:text-white font-bold">${escapeHTML(l.title)}</h4>
              <p class="text-slate-500 text-xs mt-1">Lesson ${l.sequence}</p>
            </div>
          </div>
          <span class="material-symbols-outlined ${l.is_completed ? 'text-primary' : 'text-slate-300'}">${l.is_completed ? 'check_circle' : 'play_circle'}</span>
        </div>
      </div>
    `).join('');

    $app().innerHTML = `
      ${renderTopNav()}
      <header class="md:hidden flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 w-full">
          <button onclick="App.navigate('/dashboard')" class="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 class="text-lg font-bold leading-tight flex-1 text-center pr-10">${escapeHTML(lang.name)}</h2>
      </header>
      <main class="flex-1 overflow-y-auto px-4 py-6 md:py-10 w-full max-w-4xl mx-auto">
          <div class="md:flex md:items-center md:justify-between mb-8 pb-8 border-b border-slate-200 dark:border-slate-800 hidden md:flex">
             <div class="flex items-center gap-4">
                 <button onclick="App.navigate('/dashboard')" class="text-slate-500 hover:text-primary transition-colors flex items-center mr-4"><span class="material-symbols-outlined">arrow_back</span></button>
                 <h1 class="text-3xl font-bold dark:text-white">${escapeHTML(lang.name)} Syllabus</h1>
             </div>
             <div class="text-right">
                 <p class="text-sm font-bold text-slate-500 uppercase tracking-widest">Progress ${pct}%</p>
             </div>
          </div>
          
          <div class="md:hidden flex flex-col gap-3 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
              <div class="flex gap-6 justify-between items-end">
                  <p class="text-slate-600 dark:text-slate-400 text-sm font-medium">Course Progress</p>
                  <p class="text-primary text-sm font-bold">${pct}%</p>
              </div>
              <div class="rounded-full bg-slate-100 dark:bg-slate-800 h-2 overflow-hidden">
                  <div class="h-full bg-primary transition-all duration-500" style="width: ${pct}%;"></div>
              </div>
          </div>
          <div class="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
             ${list || '<p class="text-slate-500 text-center py-10">No lessons yet.</p>'}
          </div>
      </main>
      ${renderBottomNav()}
    `;
  }

  async function page_lesson(lSlug, lesSlug) {
    const data = await Api.getLessonDetail(lSlug, lesSlug);
    const { lesson, prev_lesson, next_lesson } = data;
    
    $app().innerHTML = `
      ${renderTopNav()}
      <header class="md:hidden sticky top-0 z-10 bg-background-light dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center w-full">
          <button onclick="App.navigate('/lang/${lSlug}')" class="text-slate-900 dark:text-slate-100 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <span class="material-symbols-outlined">close</span>
          </button>
          <div class="text-sm font-bold px-3 py-1 rounded-full ${lesson.is_completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary/10 text-primary'}">
            ${lesson.is_completed ? 'Completed' : 'In Progress'}
          </div>
      </header>
      
      <main class="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12 overflow-y-auto">
          <div class="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
             <button onclick="App.navigate('/lang/${lSlug}')" class="text-slate-500 hover:text-primary transition-colors flex items-center font-bold text-sm uppercase tracking-wider gap-2">
                <span class="material-symbols-outlined text-xl">arrow_back</span> Back to Syllabus
             </button>
             <div class="text-sm font-bold px-3 py-1 rounded-full ${lesson.is_completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary/10 text-primary'}">
                ${lesson.is_completed ? 'Completed' : 'In Progress'}
             </div>
          </div>

          <article class="space-y-6 md:space-y-10">
              <header>
                  <h1 class="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight">${escapeHTML(lesson.title)}</h1>
              </header>
              ${lesson.image_url ? `<img src="${lesson.image_url}" class="rounded-xl w-full object-cover">` : ''}
              
              <div class="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                  ${lesson.content}
              </div>
              
              <div class="pt-8 pb-4">
                ${lesson.is_completed ? `
                  <button onclick="App.markIncomplete(${lesson.id},'${lSlug}','${lesSlug}')" class="w-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined">restart_alt</span>
                      <span>Mark Incomplete</span>
                  </button>
                ` : `
                  <button onclick="App.markComplete(${lesson.id},'${lSlug}','${lesSlug}')" class="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined">check_circle</span>
                      <span>Mark as Complete</span>
                  </button>
                `}
              </div>

              <div class="flex gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                 ${prev_lesson ? `<button onclick="App.navigate('/lang/${prev_lesson.language_slug}/${prev_lesson.slug}')" class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-center hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"><span class="material-symbols-outlined">arrow_back</span> Prev</button>` : `<div class="flex-1"></div>`}
                 ${next_lesson ? `<button onclick="App.navigate('/lang/${next_lesson.language_slug}/${next_lesson.slug}')" class="flex-1 bg-primary text-white border border-primary py-3 rounded-xl font-bold text-center hover:bg-primary/90 flex items-center justify-center gap-2">Next <span class="material-symbols-outlined">arrow_forward</span></button>` : `<div class="flex-1"></div>`}
              </div>
          </article>
      </main>
    `;
  }

  async function page_profile() {
    const user = currentUser;
    const p = user.profile || {};
    
    $app().innerHTML = `
      <div class="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark overflow-x-hidden">
          ${renderTopNav()}
          <div class="md:hidden flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
              <div onclick="App.navigate('/dashboard')" class="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <span class="material-symbols-outlined cursor-pointer">arrow_back</span>
              </div>
              <h2 class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Profile</h2>
          </div>
          <main class="flex-1 overflow-y-auto pb-24 md:pb-12 max-w-2xl mx-auto w-full">
            <div class="flex p-6 @container">
                <div class="flex w-full flex-col gap-6 items-center">
                    <div class="flex gap-4 flex-col items-center">
                        <div class="relative">
                            <div class="bg-primary/10 rounded-full p-1 border-2 border-primary/20">
                                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-white dark:border-background-dark bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400">
                                    ${escapeHTML(user.username.charAt(0).toUpperCase())}
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <p class="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight text-center">${escapeHTML(user.username)}</p>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal text-center mt-1">${escapeHTML(user.email || 'No email provided')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings -->
            <div class="px-6 pt-2 pb-6">
                <form id="pForm" class="flex flex-col gap-4">
                   <h3 class="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight uppercase tracking-widest text-xs opacity-60">Edit Details</h3>
                   <input id="pU" type="text" value="${escapeHTML(user.username)}" class="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary" placeholder="Username" required>
                   <input id="pE" type="email" value="${escapeHTML(user.email || '')}" class="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary" placeholder="Email" required>
                   <textarea id="pB" rows="3" class="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary" placeholder="Bio">${escapeHTML(p.bio || '')}</textarea>
                   
                   <h3 class="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight mt-4 uppercase tracking-widest text-xs opacity-60">App UI</h3>
                   <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                       <div class="flex items-center gap-3">
                           <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                               <span class="material-symbols-outlined">palette</span>
                           </div>
                           <div>
                               <p class="text-slate-900 dark:text-slate-100 font-semibold text-sm">Theme</p>
                           </div>
                       </div>
                       <select id="pT" class="bg-transparent text-sm font-medium text-slate-500 border-none outline-none focus:ring-0 appearance-none text-right cursor-pointer">
                           <option value="light" ${p.theme === 'light' ? 'selected' : ''}>Light Mode</option>
                           <option value="dark" ${p.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                       </select>
                   </div>
                   
                   <button type="submit" class="w-full mt-4 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors">
                      Save Profile
                   </button>
                   <button type="button" onclick="App.logout()" class="w-full mt-2 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold py-4 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
                      Log Out
                   </button>
                </form>
            </div>
          </main>
          ${renderBottomNav()}
      </div>
    `;

    document.getElementById('pForm').onsubmit = async (e) => {
      e.preventDefault();
      try {
        currentUser = await Api.updateProfile({ username:pU.value, email:pE.value, bio:pB.value, theme:pT.value });
        const t = currentUser.profile.theme;
        if(t === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', t);
        toast('Profile updated!', 'success');
      } catch (err) { toast('Error updating profile', 'error'); }
    };
  }

  // Admin Views (re-implemented with tailwind)
  async function page_admin() {
    const ls = await Api.getAdminLessons();
    const rows = ls.map(l => `
      <tr class="border-b border-slate-200 dark:border-slate-800">
        <td class="p-4 text-sm">${escapeHTML(l.language_name)}</td>
        <td class="p-4 font-bold text-sm">${escapeHTML(l.title)}</td>
        <td class="p-4 text-sm">${l.sequence}</td>
        <td class="p-4"><span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-lg">${l.is_published?'Pub':'Draft'}</span></td>
        <td class="p-4 flex gap-2">
            <button class="bg-slate-200 dark:bg-slate-800 p-2 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center" onclick="App.navigate('/manage/edit/${l.id}')"><span class="material-symbols-outlined text-[18px]">edit</span></button>
            <button class="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-2 rounded hover:bg-red-200 transition flex items-center" onclick="App.deleteLesson(${l.id})"><span class="material-symbols-outlined text-[18px]">delete</span></button>
        </td>
      </tr>
    `).join('');

    $app().innerHTML = `
      ${renderTopNav()}
      <header class="md:hidden flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 w-full">
        <h2 class="text-lg font-bold leading-tight flex-1">Content Manager</h2>
        <button onclick="App.navigate('/manage/create')" class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">New</button>
      </header>
      <main class="flex-1 overflow-x-auto w-full max-w-5xl mx-auto p-4 md:py-8 pb-20">
         <div class="hidden md:flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold dark:text-white">Content Manager</h1>
            <button onclick="App.navigate('/manage/create')" class="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 flex items-center gap-2">
                 <span class="material-symbols-outlined text-[20px]">add</span> New Lesson
            </button>
         </div>
         <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
             <table class="w-full text-left">
               <thead class="bg-slate-50 dark:bg-slate-800/50">
                  <tr><th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Lang</th><th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Title</th><th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Seq</th><th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Stat</th><th class="p-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Action</th></tr>
               </thead>
               <tbody>${rows || '<tr><td colspan="5" class="p-8 text-center text-slate-500">No lessons.</td></tr>'}</tbody>
             </table>
         </div>
      </main>
      ${renderBottomNav()}
    `;
  }

  const slugify = text => text.toLowerCase().trim().replace(/\\s+/g, '-').replace(/[^\\w-]/g, '');

  async function page_adminCreate() { 
    let languages = [];
    try { languages = await Api.getLanguages(); } catch {}

    const langOptions = languages.map(l => `<option value="${l.id}">${escapeHTML(l.name)}</option>`).join('');

    $app().innerHTML = `
      <header class="flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 w-full">
        <button onclick="App.navigate('/manage')" class="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mr-2">
            <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 class="text-lg font-bold leading-tight flex-1">Create Lesson</h2>
      </header>
      <main class="flex-1 overflow-y-auto px-4 py-6 w-full max-w-2xl mx-auto pb-24">
         <form id="createFrm" class="flex flex-col gap-4">
             <label class="font-bold">Language</label>
             <select id="cLang" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>${langOptions}</select>
             
             <label class="font-bold">Title</label>
             <input id="cTitle" type="text" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>
             
             <label class="font-bold">Slug (auto-generated)</label>
             <input id="cSlug" type="text" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary">
             
             <label class="font-bold">Sequence</label>
             <input id="cSeq" type="number" value="1" min="1" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>
             
             <label class="font-bold">Content (Markdown / HTML)</label>
             <textarea id="cContent" rows="8" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required></textarea>
             
             <label class="font-bold">Feature Image (Optional)</label>
             <input id="cImg" type="file" accept="image/*" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary">
             
             <div class="flex items-center gap-3 mt-2">
               <input id="cPub" type="checkbox" checked class="w-5 h-5 accent-primary">
               <label class="font-bold">Published</label>
             </div>
             
             <button type="submit" class="w-full mt-6 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors">
                Save Lesson
             </button>
         </form>
      </main>
      ${renderBottomNav()}
    `;

    document.getElementById('cTitle').addEventListener('input', (e) => {
      const slugInput = document.getElementById('cSlug');
      if (!slugInput.dataset.manual) slugInput.value = slugify(e.target.value);
    });
    document.getElementById('cSlug').addEventListener('input', function() { this.dataset.manual = '1'; });

    document.getElementById('createFrm').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append('language', document.getElementById('cLang').value);
      fd.append('title', document.getElementById('cTitle').value);
      fd.append('slug', document.getElementById('cSlug').value || slugify(document.getElementById('cTitle').value));
      fd.append('sequence', document.getElementById('cSeq').value);
      fd.append('content', document.getElementById('cContent').value);
      fd.append('is_published', document.getElementById('cPub').checked);
      const img = document.getElementById('cImg').files[0];
      if (img) fd.append('image', img);

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Saving...';
      try {
        await Api.createLesson(fd);
        toast('Lesson created successfully!', 'success');
        navigate('/manage');
      } catch (err) {
        toast('Failed to create lesson.', 'error');
        btn.disabled = false; btn.textContent = 'Save Lesson';
      }
    };
  }

  async function page_adminEdit(id) {
    let languages = [];
    let lessons = [];
    try {
      languages = await Api.getLanguages();
      lessons = await Api.getAdminLessons();
    } catch {}

    const listLesson = lessons.find(l => l.id === parseInt(id));
    if (!listLesson) { $app().innerHTML = '<p class="p-8 text-center text-red-500">Lesson not found.</p>'; return; }

    let fullLesson = listLesson;
    try {
      const lang = languages.find(l => l.id === listLesson.language);
      if (lang) {
        const detail = await Api.getLessonDetail(lang.slug, listLesson.slug);
        fullLesson = detail.lesson;
      }
    } catch {}

    const langOptions = languages.map(l => `<option value="${l.id}" ${l.id === fullLesson.language ? 'selected' : ''}>${escapeHTML(l.name)}</option>`).join('');

    $app().innerHTML = `
      <header class="flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 w-full">
        <button onclick="App.navigate('/manage')" class="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mr-2">
            <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 class="text-lg font-bold leading-tight flex-1">Edit Lesson</h2>
      </header>
      <main class="flex-1 overflow-y-auto px-4 py-6 w-full max-w-2xl mx-auto pb-24">
         <form id="editFrm" class="flex flex-col gap-4">
             <label class="font-bold">Language</label>
             <select id="eLang" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>${langOptions}</select>
             
             <label class="font-bold">Title</label>
             <input id="eTitle" type="text" value="${escapeHTML(fullLesson.title)}" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>
             
             <label class="font-bold">Slug</label>
             <input id="eSlug" type="text" value="${escapeHTML(fullLesson.slug)}" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>
             
             <label class="font-bold">Sequence</label>
             <input id="eSeq" type="number" value="${fullLesson.sequence}" min="1" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>
             
             <label class="font-bold">Content</label>
             <textarea id="eContent" rows="8" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary" required>${escapeHTML(fullLesson.content || '')}</textarea>
             
             ${fullLesson.image_url ? `<img src="${fullLesson.image_url}" class="max-h-32 object-contain bg-slate-100 rounded-lg p-2">` : ''}
             <label class="font-bold">Update Image</label>
             <input id="eImg" type="file" accept="image/*" class="form-input bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-none outline-none focus:ring-2 focus:ring-primary">
             
             <div class="flex items-center gap-3 mt-2">
               <input id="ePub" type="checkbox" ${fullLesson.is_published ? 'checked' : ''} class="w-5 h-5 accent-primary">
               <label class="font-bold">Published</label>
             </div>
             
             <button type="submit" class="w-full mt-6 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors">
                Update Lesson
             </button>
         </form>
      </main>
      ${renderBottomNav()}
    `;

    document.getElementById('editFrm').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append('language', document.getElementById('eLang').value);
      fd.append('title', document.getElementById('eTitle').value);
      fd.append('slug', document.getElementById('eSlug').value);
      fd.append('sequence', document.getElementById('eSeq').value);
      fd.append('content', document.getElementById('eContent').value);
      fd.append('is_published', document.getElementById('ePub').checked);
      const img = document.getElementById('eImg').files[0];
      if (img) fd.append('image', img);

      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Updating...';
      try {
        await Api.editLesson(id, fd);
        toast('Lesson updated successfully!', 'success');
        navigate('/manage');
      } catch (err) {
        toast('Failed to update lesson.', 'error');
        btn.disabled = false; btn.textContent = 'Update Lesson';
      }
    };
  }

  window.App = {
    navigate,
    logout: async () => { await Api.logout(); currentUser=null; window.location.href='index.html'; },
    markComplete: async (i, ls, les) => { await Api.markComplete(i); toast('Awesome!','success'); page_lesson(ls, les); },
    markIncomplete: async (i, ls, les) => { await Api.markIncomplete(i); toast('Marked incomplete.','info'); page_lesson(ls, les); },
    deleteLesson: async (id) => { if (confirm("Delete this lesson?")) { await Api.deleteLesson(id); page_admin(); toast('Deleted.','success')} }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('hashchange', router);
    router();
  });
})();

