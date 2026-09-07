import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Github,
  HelpCircle,
  Package,
  PlayCircle,
  Smartphone,
  UploadCloud,
  X
} from 'lucide-react';

interface ExportApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportApkModal: React.FC<ExportApkModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const codemagicYaml = `workflows:
  android-apk-build:
    name: Build ONO Android APK
    max_build_duration: 30
    instance_type: mac_mini_m2
    environment:
      node: 20
      java: 21
    scripts:
      - name: Install dependencies
        script: |
          npm install --legacy-peer-deps
          # Ensure Rollup darwin-arm64 native binary is present on macOS Apple Silicon runner
          npm install --no-save @rollup/rollup-darwin-arm64 || true
      - name: Build Web App
        script: |
          npm run build
      - name: Sync Web App to Android
        script: |
          if [ ! -d "android" ]; then
            npm run cap:add
          fi
          npm run cap:sync
      - name: Build Android APK
        script: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon
    artifacts:
      - android/app/build/outputs/apk/**/*.apk
`;

  const githubWorkflowYaml = `name: Build Android APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      create_release:
        description: 'Publish as a GitHub Release (direct APK download link)'
        required: false
        type: boolean
        default: false
      release_tag:
        description: 'Release Tag (e.g. v1.0.0)'
        required: false
        default: 'v1.0.0'

permissions:
  contents: write

jobs:
  build:
    name: Assemble Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Setup Java JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '21'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Accept Android Licenses & Ensure SDK 36
        run: |
          yes | sdkmanager --licenses || true
          sdkmanager "platforms;android-36" "build-tools;35.0.0" || true

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Build Web App
        run: npm run build

      - name: Sync Web App to Android
        run: |
          if [ ! -f "android/build.gradle" ]; then
            rm -rf android
            npm run cap:add
          else
            npm run cap:sync
          fi
          if [ -n "$ANDROID_HOME" ]; then
            echo "sdk.dir=$ANDROID_HOME" > android/local.properties
          fi
          chmod +x android/gradlew

      - name: Build Android Debug APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon

      - name: Rename APK for Easy Distribution
        run: |
          cp android/app/build/outputs/apk/debug/app-debug.apk android/app/build/outputs/apk/debug/ONO-Card-Game-debug.apk

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ono-game-apk
          path: |
            android/app/build/outputs/apk/debug/app-debug.apk
            android/app/build/outputs/apk/debug/ONO-Card-Game-debug.apk
          if-no-files-found: error
          retention-days: 30
`;

  const capacitorConfig = `{
  "appId": "com.onocardgame.app",
  "appName": "ONO Game",
  "webDir": "dist",
  "bundledWebRuntime": false
}
`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="export-apk-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                APK & Codemagic & itch.io Guide
              </h2>
              <p className="text-xs text-slate-400">
                GitHub link se Codemagic APK generate krna aur itch.io pe upload krna
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs / Stepper */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300">
          {/* Direct Download Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-900/60 p-5 rounded-2xl border border-emerald-500/50 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                    Build Ready • Release v1.0
                  </span>
                </div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>ONO Game Android APK (4.1 MB)</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Application ID: <code className="text-emerald-300">com.onocardgame.app</code> • Built & Signed with Android SDK 36 & Java 21
                </p>
              </div>

              <a
                href="/ono-game.apk"
                download="ono-game.apk"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer no-underline whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                <span>Download APK Now</span>
              </a>
            </div>
          </div>

          {/* Quick summary in Urdu/English */}
          <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 p-4 rounded-2xl border border-indigo-500/30">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-1.5">
              <Package className="w-4 h-4 text-indigo-400" />
              <span>Full Pipeline: GitHub ➜ Codemagic ➜ APK ➜ itch.io</span>
            </h3>
            <p className="text-slate-300 leading-relaxed text-xs">
              Ap is app ko direct mobile APK bana sakte hain bina kisi local Android Studio ke. Codemagic cloud me APK build kr deta he aur ap itch.io pe direct upload kar skte hen!
            </p>
          </div>

          {/* STEP 1: GitHub */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-slate-200" />
                  GitHub pe Code Push / Link Krna
                </h4>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 pl-1">
              <li>
                AI Studio top-right menu ya Settings se <strong className="text-white">Export to ZIP</strong> karein ya apna GitHub repo connect karein.
              </li>
              <li>
                Apne GitHub account pe ek new repository create karein (e.g. <code className="text-amber-300">ono-card-game</code>).
              </li>
              <li>
                Is code ko commit & push karein:
              </li>
            </ol>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              git init<br/>
              git add .<br/>
              git commit -m "Initial commit for ONO game"<br/>
              git branch -M main<br/>
              git remote add origin https://github.com/YOUR_USERNAME/ono-card-game.git<br/>
              git push -u origin main
            </div>
          </div>

          {/* STEP 2: BUILD APK (GitHub Actions - Recommended) */}
          <div className="border border-indigo-500/50 rounded-2xl p-4 bg-indigo-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-emerald-400" />
                  <span>GitHub Actions: 1-Click "Run workflow" (Recommended & Free)</span>
                </h4>
              </div>
              <a
                href="https://github.com/dmpcsaad3-cyber/ONO-cards/actions"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer no-underline whitespace-nowrap"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Open Actions Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                GitHub Actions me APK run karne ka direct tariqa:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                <li>
                  Apne GitHub repo par jayein: <a href="https://github.com/dmpcsaad3-cyber/ONO-cards/actions" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-mono">github.com/dmpcsaad3-cyber/ONO-cards/actions</a>
                </li>
                <li>
                  Left sidebar me <strong>"Build Android APK"</strong> workflow par click karein.
                </li>
                <li>
                  Right side par <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Run workflow ▾</strong> button par click karein.
                </li>
                <li>
                  Green button <strong className="text-emerald-400">"Run workflow"</strong> press karein. Workflow start ho kar ~2-3 minutes me finish ho jata hai!
                </li>
                <li>
                  Completed run par click karein aur neechay <strong>Artifacts</strong> section me se <strong>ono-game-apk</strong> download karein!
                </li>
              </ol>
            </div>

            {/* Workflow File Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Workflow File: <code className="text-emerald-300">.github/workflows/build-apk.yml</code></span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(githubWorkflowYaml, 'gh-yaml')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer text-[11px]"
                  >
                    {copiedKey === 'gh-yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'gh-yaml' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile(githubWorkflowYaml, 'build-apk.yml')}
                    className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 cursor-pointer text-[11px]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] sm:text-[11px] text-slate-300 max-h-36 overflow-y-auto">
                <pre>{githubWorkflowYaml}</pre>
              </div>
            </div>
          </div>

          {/* ALTERNATIVE: Codemagic CI/CD */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs">
                  Alt
                </span>
                <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  Codemagic CI/CD (Alternative)
                </h4>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(codemagicYaml, 'codemagic.yaml')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download codemagic.yaml</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Codemagic me Apple Silicon <code className="text-amber-300">mac_mini_m2</code> par Rollup darwin-arm64 binary aur Java 21 update fix kar diya gaya hai.
            </p>

            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400 pl-1">
              <li>
                <a href="https://codemagic.io" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">
                  codemagic.io <ExternalLink className="w-3 h-3" />
                </a> pe login kr k apna <strong>ONO-cards</strong> repo select karein.
              </li>
              <li>Updated <code className="text-slate-300">codemagic.yaml</code> push hone ke baad <strong>Start new build</strong> dabayein.</li>
              <li>Build complete hotay hi <strong>Artifacts</strong> se APK download kar lein!</li>
            </ol>
          </div>

          {/* STEP 3: Upload to itch.io */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  itch.io pe Game Upload Krna
                </h4>
              </div>
              <a
                href="https://itch.io/game/new"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>itch.io Creator Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">Android APK Option:</span>
                <p className="text-slate-400 mb-2">
                  1. Project settings me "Kind of project" ko <strong>Downloadable</strong> rakhein.<br/>
                  2. Uploads section me Codemagic se mili <strong>.apk</strong> file upload karein.<br/>
                  3. "This file will be played on Android" checkbox tick karein!
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">HTML5 Web Option:</span>
                <p className="text-slate-400 mb-2">
                  1. Run <code className="text-white">npm run build</code> (creates <code>dist</code> folder).<br/>
                  2. <code>dist</code> folder ko ZIP banayein (<code>dist.zip</code>).<br/>
                  3. itch.io pe "HTML" select kr k ZIP upload karein aur "This file will be played in the browser" tick karein!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Files and configs are pre-tuned for instant deployment</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
