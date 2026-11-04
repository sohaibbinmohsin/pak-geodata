import { Github, Globe, Instagram, Linkedin, Mail, Package, Terminal } from 'lucide-react';
import mohsinLogo from '../assets/mohsin-project-logo.svg';
import { PACKAGE_VERSION } from '../version';

export interface FooterProps {
  className?: string;
}

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.488-8.404" />
    </svg>
  );
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`border-t border-white/10 bg-[#070a10]/80 backdrop-blur-md text-neutral-400 text-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Branding & Compact License Links */}
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
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <a
                href="https://github.com/sohaibbinmohsin/pak-geodata/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-300 transition-colors"
                title="Released under the MIT License."
              >
                MIT (Code)
              </a>
              <span className="text-neutral-600">•</span>
              <a
                href="https://github.com/sohaibbinmohsin/pak-geodata/blob/main/LICENSE-DATA"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-300 transition-colors"
                title="Geographic data under ODbL 1.0 & CC-BY 4.0 (© OpenStreetMap contributors, NGA/GeoNames)"
              >
                ODbL (Data)
              </a>
            </div>
          </div>

          {/* Right: Social & Registry Channels */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Social & Contact Icons from themohsinproject.org */}
            <div className="flex items-center gap-2 text-neutral-400">
              <a
                href="https://themohsinproject.org"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="The Mohsin Project Official Website"
                aria-label="The Mohsin Project Official Website"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/themohsinproject/"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="The Mohsin Project on LinkedIn"
                aria-label="The Mohsin Project on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/themohsinproject/"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="The Mohsin Project on Instagram"
                aria-label="The Mohsin Project on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/923390008674"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
                title="Direct chat on WhatsApp: 0339 000 8674 (TMPG)"
                aria-label="Direct chat on WhatsApp: 0339 000 8674 (TMPG)"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@themohsinproject.org"
                className="pressable p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Email: hello@themohsinproject.org"
                aria-label="Email: hello@themohsinproject.org"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <div className="hidden sm:block h-5 w-px bg-white/10" aria-hidden="true" />

            {/* Registry & Repository Links */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
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
      </div>
    </footer>
  );
}
