import Link from 'next/link';
import { leftSidebarData } from '../data';
const LeftSidebar = () => {
  return <div className="nav-sidenav p-4 bg-mode h-100 custom-scrollbar">
      <ul className="nav nav-link-secondary flex-column fw-bold gap-2">
        {leftSidebarData.map(({
        icon: Icon,
        label,
        url,
        external
      }, idx) => <li className="nav-item" key={idx}>
            {external ? <a className="nav-link" href={url ?? ''} target="_blank" rel="noopener noreferrer">
              <span className="nav-icon">
                {' '}
                <Icon />
              </span>{' '}
              <span className="nav-text">{label} </span>
            </a> : <Link className="nav-link" href={url ?? ''}>
              <span className="nav-icon">
                {' '}
                <Icon />
              </span>{' '}
              <span className="nav-text">{label} </span>
            </Link>}
          </li>)}
      </ul>
    </div>;
};
export default LeftSidebar;