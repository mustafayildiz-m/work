'use client';

import Link from 'next/link';

const PeopleCoverCard = ({
  coverUrl,
  avatarUrl,
  name,
  meta,
  bio,
  profileHref,
  badge,
  footer,
  onAvatarError,
}) => {
  const handleCoverError = (e) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.closest('.feed-scholar-cover')?.classList.remove('has-cover');
  };

  return (
    <article className="feed-scholar-card">
      <div className={`feed-scholar-cover${coverUrl ? ' has-cover' : ''}`}>
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="feed-scholar-cover-img"
            loading="lazy"
            onError={handleCoverError}
          />
        )}
      </div>

      <div className="feed-scholar-body">
        <div className="feed-scholar-avatar-wrap">
          {profileHref ? (
            <Link href={profileHref}>
              <img
                src={avatarUrl}
                alt={name || ''}
                className="feed-scholar-avatar"
                onError={onAvatarError}
              />
            </Link>
          ) : (
            <img
              src={avatarUrl}
              alt={name || ''}
              className="feed-scholar-avatar"
              onError={onAvatarError}
            />
          )}
        </div>

        {badge && (
          <span className={`feed-scholar-badge ${badge.variant || 'is-user'}`}>
            {badge.label}
          </span>
        )}

        {profileHref ? (
          <Link href={profileHref} className="feed-scholar-name">
            {name}
          </Link>
        ) : (
          <span className="feed-scholar-name">{name}</span>
        )}

        {meta && <p className="feed-scholar-meta">{meta}</p>}
        {bio && <p className="feed-scholar-bio">{bio}</p>}

        {footer && <div className="feed-scholar-actions">{footer}</div>}
      </div>
    </article>
  );
};

export default PeopleCoverCard;
