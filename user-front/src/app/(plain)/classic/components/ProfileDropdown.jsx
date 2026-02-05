'use client';

import { Dropdown, DropdownMenu, DropdownToggle, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Image from 'next/image';
import { BsCardText, BsCircleHalf, BsGear, BsLifePreserver, BsMoonStars, BsPower, BsSun } from 'react-icons/bs';
import clsx from 'clsx';
import Link from 'next/link';
import { developedByLink } from '@/context/constants';
import { toSentenceCase } from '@/utils/change-casing';
import { useLayoutContext } from '@/context/useLayoutContext';
import avatar7 from '@/assets/images/avatar/07.jpg';
const ProfileDropdown = () => {
  const themeModes = [{
    icon: BsSun,
    theme: 'light'
  }, {
    icon: BsMoonStars,
    theme: 'dark'
  }, {
    icon: BsCircleHalf,
    theme: 'auto'
  }];
  const {
    theme: themeMode,
    updateTheme
  } = useLayoutContext();
  return <Dropdown as="li" className="nav-item ms-2" drop="down" align="end">
      <DropdownToggle className="nav-link btn icon-md p-0 content-none" role="button" data-bs-auto-close="outside" data-bs-display="static" data-bs-toggle="dropdown" aria-expanded="false">
        <Image className="avatar-img rounded-2" src={avatar7} alt="avatar" />
      </DropdownToggle>
      <DropdownMenu className="dropdown-animation dropdown-menu-end pt-3 small me-md-n3" aria-labelledby="profileDropdown">
        <li className="px-3">
          <div className="d-flex align-items-center position-relative">
            <div className="avatar me-3">
              <Image className="avatar-img rounded-circle" src={avatar7} alt="avatar" />
            </div>
            <div>
              <Link className="h6 stretched-link" href="">
                Gazzâlî
              </Link>
              <p className="small m-0">Alim</p>
            </div>
          </div>
          <Link className="dropdown-item btn btn-primary-soft btn-sm my-2 text-center" href="/profile/feed">
            Profili görüntüle
          </Link>
        </li>

        <li>
          <a className="dropdown-item" href="/settings/account">
            <BsGear className="fa-fw me-2" />
            Ayarlar &amp; Politikalar
          </a>
        </li>
        <li>
          <a className="dropdown-item" href={developedByLink} rel="noreferrer" target="_blank">
            <BsLifePreserver className="fa-fw me-2" />
            Destek
          </a>
        </li>
        <li className="dropdown-divider" />
        <li>
          <Link className="dropdown-item bg-danger-soft-hover" href="/auth-advance/sign-in">
            <BsPower className="fa-fw me-2" />
            Çıkış yap
          </Link>
        </li>
        <li>
          {' '}
          <hr className="dropdown-divider" />
        </li>

        <li>
          <div className="modeswitch-item theme-icon-active d-flex justify-content-center gap-3 align-items-center p-2 pb-0">
            <span>Tema:</span>

            {themeModes.map(({
            icon: Icon,
            theme
          }, idx) => <OverlayTrigger key={theme + idx} overlay={<Tooltip>{toSentenceCase(theme)}</Tooltip>}>
                <button type="button" className={clsx('btn btn-modeswitch nav-link text-primary-hover mb-0', {
              active: theme === themeMode
            })} onClick={() => updateTheme(theme)}>
                  <Icon />
                </button>
              </OverlayTrigger>)}
          </div>
        </li>
      </DropdownMenu>
    </Dropdown>;
};
export default ProfileDropdown;