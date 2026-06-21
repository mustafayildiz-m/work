import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Frontend LogoBox ile aynı marka: simge kırpımı + ISLAMIC / WINDOWS wordmark.
 * `dark` → koyu zemin (sidebar), `light` → açık zemin (mobil header).
 */
export function AdminLogo({ to = '/', className, variant = 'dark', ...props }) {
  const isDark = variant === 'dark';

  return (
    <Link
      to={to}
      className={cn('iw-admin-logo', isDark ? 'iw-admin-logo-dark' : 'iw-admin-logo-light', className)}
      aria-label="Islamic Windows Admin"
      title="Islamic Windows"
      {...props}
    >
      <span className="iw-admin-logo-full default-logo">
        <span className="iw-admin-logo-icon" aria-hidden="true" />
        <span className="iw-admin-logo-wordmark">
          <span className="iw-admin-logo-word">ISLAMIC</span>
          <span className="iw-admin-logo-word">WINDOWS</span>
        </span>
      </span>
      <span className="iw-admin-logo-icon-only small-logo" aria-hidden="true">
        <span className="iw-admin-logo-icon" />
      </span>
    </Link>
  );
}
