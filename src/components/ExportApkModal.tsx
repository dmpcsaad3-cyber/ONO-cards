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
      java: 17
    scripts:
      - name: Install dependencies
        script: |
          npm install
      - name: Build Web App
        script: |
          npm run build
      - name: Sync Web App to Android
        script: |
          npx cap sync android
      - name: Build Android APK
        script: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug
    artifacts:
      - android/app/build/outputs/apk/**/*.apk
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

          {/* STEP 2: Codemagic CI/CD */}
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  Codemagic me APK Generate Krna
                </h4>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(codemagicYaml, 'codemagic.yaml')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download codemagic.yaml</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Codemagic root folder me <code className="text-amber-300">codemagic.yaml</code> file ko detect kr k auto APK build kar deta hai.
            </p>

            <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-200">
              💡 <strong>Free Tier Instance Note:</strong> Codemagic ke Free Personal Account par sirf <code className="text-white font-mono">mac_mini_m2</code> allowed hota hai (500 free minutes). Agar koi aur instance select ho to "instance type is not available with current billing plan" error aata hai. Humne isko <code className="text-white font-mono">mac_mini_m2</code> par set kar diya hai. Sath hi agar aap bina kisi wait ke instant APK chahein, to repository me GitHub Actions (<code className="text-white font-mono">.github/workflows/build-apk.yml</code>) se direct 100% free APK download kar sakte hain!
            </div>

            <div className="relative">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] sm:text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                <pre>{codemagicYaml}</pre>
              </div>
              <button
                onClick={() => copyToClipboard(codemagicYaml, 'yaml')}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'yaml' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400 pl-1">
              <li>
                <a href="https://codemagic.io" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">
                  codemagic.io <ExternalLink className="w-3 h-3" />
                </a> pe GitHub se free sign in karein.
              </li>
              <li>"Add Application" pe click kr k apna <strong>ono-card-game</strong> repo select karein.</li>
              <li>Codemagic automatically is yaml ko read karega aur <strong>Start new build</strong> button dabate hi APK build start ho jaega!</li>
              <li>Build complete hotay hi <strong>Artifacts</strong> section se direct <code>.apk</code> download kr lein!</li>
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
