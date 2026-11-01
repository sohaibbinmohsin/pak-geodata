import { useState, useMemo } from 'react';
import type { PakistanArea } from 'pak-geodata';
import { Copy, Check, Terminal } from 'lucide-react';
import {
  type CodeLanguage,
  generateCodeSnippet,
  getCityExportVar,
} from './codeSnippets';

export interface CodeGeneratorProps {
  area: PakistanArea;
  className?: string;
}

export default function CodeGenerator({
  area,
  className = '',
}: CodeGeneratorProps) {
  const [language, setLanguage] = useState<CodeLanguage>('typescript');
  const [copied, setCopied] = useState(false);

  const rawSnippet = useMemo(
    () => generateCodeSnippet(area, language),
    [area, language]
  );

  const escapedName = area.name.replace(/'/g, "\\'");
  const citySlug = area.cityId;
  const exportVar = getCityExportVar(citySlug);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(rawSnippet);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = rawSnippet;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code snippet to clipboard', err);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header Row: Segmented Language Toggle + Copy Button */}
      <div className="flex items-center justify-between gap-2">
        {/* Segmented Toggle Control */}
        <div
          role="tablist"
          aria-label="Code language"
          className="inline-flex p-0.5 rounded-xl bg-black/40 border border-white/10"
        >
          <button
            type="button"
            role="tab"
            aria-selected={language === 'typescript'}
            onClick={() => setLanguage('typescript')}
            className={`pressable px-3 py-1 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
              language === 'typescript'
                ? 'bg-white/15 text-white font-medium shadow-sm border border-white/15'
                : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
            }`}
          >
            TypeScript
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={language === 'python'}
            onClick={() => setLanguage('python')}
            className={`pressable px-3 py-1 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
              language === 'python'
                ? 'bg-white/15 text-white font-medium shadow-sm border border-white/15'
                : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
            }`}
          >
            Python
          </button>
        </div>

        {/* 1-Click Copy Button with Checkmark Micro-Animation */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Code snippet copied' : 'Copy code snippet'}
          className={`pressable inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-pop" />
              <span className="font-semibold text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Snippet Box */}
      <div className="relative rounded-xl bg-black/55 border border-white/10 p-3 select-text overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-neutral-500" />
            <span>{language === 'typescript' ? 'quickstart.ts' : 'quickstart.py'}</span>
          </div>
          <span className="text-[10px] text-neutral-500">
            {language === 'typescript' ? 'Zero-runtime • ~24 KB' : 'Pure Python • Typed'}
          </span>
        </div>

        {language === 'typescript' ? (
          <pre className="font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto text-neutral-200">
            <code>
              <div>
                <span className="text-purple-400">import</span> {'{ '}<span className="text-cyan-300">searchAreas</span>, <span className="text-cyan-300">getNearestArea</span>{' }'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'pak-geodata'</span>;
              </div>
              <div className="text-neutral-500 italic">
                // Subpath tree-shaking (~24 KB):
              </div>
              <div>
                <span className="text-purple-400">import</span> {'{ '}<span className="text-cyan-300">{exportVar}</span>{' }'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'pak-geodata/areas/{citySlug}'</span>;
              </div>
              <br />
              <div>
                <span className="text-purple-400">const</span> area = <span className="text-cyan-300">searchAreas</span>(<span className="text-emerald-300">'{escapedName}'</span>, {'{'} cityId: <span className="text-emerald-300">'{area.cityId}'</span> {'}'})[<span className="text-amber-400">0</span>];
              </div>
            </code>
          </pre>
        ) : (
          <pre className="font-mono text-[11px] sm:text-xs leading-relaxed overflow-x-auto text-neutral-200">
            <code>
              <div>
                <span className="text-purple-400">from</span> pak_geodata <span className="text-purple-400">import</span> <span className="text-cyan-300">search_areas</span>, <span className="text-cyan-300">get_nearest_area</span>
              </div>
              <br />
              <div>
                area = <span className="text-cyan-300">search_areas</span>(<span className="text-emerald-300">'{escapedName}'</span>, city_id=<span className="text-emerald-300">'{area.cityId}'</span>)[<span className="text-amber-400">0</span>]
              </div>
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}
