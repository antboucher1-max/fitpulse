12:37:47.815 Running build in Washington, D.C., USA (East) – iad1
12:37:47.815 Build machine configuration: 2 cores, 8 GB
12:37:47.957 Cloning github.com/antboucher1-max/fitpulse (Branch: main, Commit: f770c3b)
12:37:48.459 Cloning completed: 502.000ms
12:37:48.586 Restored build cache from previous deployment (CpqEe4Adhor3pcWdPeQCgYAsrxEK)
12:37:48.830 Running "vercel build"
12:37:48.877 Vercel CLI 59.3.0
12:37:49.448 Installing dependencies...
12:37:51.820 
12:37:51.820 up to date in 2s
12:37:51.820 
12:37:51.820 270 packages are looking for funding
12:37:51.821   run `npm fund` for details
12:37:51.822 npm warn allow-scripts 2 packages have install scripts not yet covered by allowScripts:
12:37:51.822 npm warn allow-scripts   core-js@3.50.0 (postinstall: node -e "try{require('./postinstall')}catch(e){}")
12:37:51.823 npm warn allow-scripts   core-js-pure@3.50.0 (postinstall: node -e "try{require('./postinstall')}catch(e){}")
12:37:51.823 npm warn allow-scripts
12:37:51.824 npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
12:37:51.825 npm notice
12:37:51.825 npm notice New major version of npm available! 11.17.0 -> 12.0.2
12:37:51.826 npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.0.2
12:37:51.826 npm notice To update run: npm install -g npm@12.0.2
12:37:51.826 npm notice
12:37:51.872 Running "npm run build"
12:37:51.974 
12:37:51.975 > react-ts@0.0.0 build
12:37:51.975 > react-scripts build
12:37:51.975 
12:37:53.505 (node:104) [DEP0176] DeprecationWarning: fs.F_OK is deprecated, use fs.constants.F_OK instead
12:37:53.506 (Use `node --trace-deprecation ...` to show where the warning was created)
12:37:53.507 
12:37:53.509 Creating an optimized production build...
12:38:02.513 Failed to compile.
12:38:02.516 
12:38:02.516 TS2306: File '/vercel/path0/src/components/ChatTab.tsx' is not a module.
12:38:02.517     16 | import FitBotTab from './components/FitBotTab';
12:38:02.517     17 | import ExercisesTab from './components/ExercisesTab';
12:38:02.517   > 18 | import ChatTab from './components/ChatTab';
12:38:02.518        |                     ^^^^^^^^^^^^^^^^^^^^^^
12:38:02.518     19 | import CalculatorTab from './components/CalculatorTab';
12:38:02.518     20 | import ProfileTab from './components/ProfileTab';
12:38:02.518     21 |
12:38:02.518 
12:38:02.518 
12:38:02.628 Error: Command "npm run build" exited with 1
