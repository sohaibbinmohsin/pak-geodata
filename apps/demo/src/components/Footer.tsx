import { Github, Package, Terminal } from 'lucide-react';
import mohsinLogo from '../assets/mohsin-project-logo.svg';
import { PACKAGE_VERSION } from '../version';

export interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`border-t border-white/10 bg-[#070a10]/80 backdrop-blur-md text-neutral-400 text-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Branding, Attribution and License */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg select-none" role="img" aria-label="Pakistan flag">🇵🇰</span>
              <span className="font-mono font-bold text-white tracking-tight">GeoData</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {PACKAGE_VERSION}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              A free software by{' '}
              <a
                href="https://themohsinproject.org"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-neutral-300 hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium"
                title="The Mohsin Project Global"
              >
                <span>The Mohsin Project</span>
                <img src={mohsinLogo} alt="The Mohsin Project logo" className="w-4 h-4 object-contain opacity-90 hover:opacity-100" />
              </a>
            </p>
            <p className="text-xs text-neutral-500">
              Released under the MIT License.
            </p>
          </div>

          {/* Right: Package Registry & Repository Links */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
            <a
              href="https://github.com/sohaibbinmohsin/pak-geodata"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4 text-neutral-400" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.npmjs.com/package/pak-geodata"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4 text-red-400" />
              <span>NPM</span>
            </a>
            <a
              href="https://pypi.org/project/pak-geodata/"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>PyPI</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
