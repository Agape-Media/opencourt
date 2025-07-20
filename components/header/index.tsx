import clsx from 'clsx';
import { siteConfig } from '@/lib/content';
import { NavbarLink, NavbarLinkBackground } from './link';

export const Header = async () => {
  const navItems = siteConfig.settings.navigation;

  return (
    <div className="flex flex-col items-center justify-center">
      <nav className="bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
        <div
          className={clsx(
            'bg-transparent rounded-full p-1 flex relative items-center',
            'shadow-[0px_8px_30px_0px_rgba(0,0,0,0.3)]'
          )}
        >
          {/* Animated background */}
          <NavbarLinkBackground links={navItems.map((item) => item.url)} />

          {/* Navigation items */}
          {navItems.map(({ url, label }) => (
            <NavbarLink key={url} href={url}>
              {label}
            </NavbarLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
