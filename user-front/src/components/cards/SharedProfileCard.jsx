'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { BsPersonFill, BsPatchCheckFill, BsThreeDots, BsTrash } from 'react-icons/bs';
import { useState, useEffect } from 'react';
import avatar7 from '@/assets/images/avatar/07.jpg';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { getUserIdFromToken } from '@/utils/auth';
import CustomConfirmDialog from '../CustomConfirmDialog';

const SharedProfileCard = ({
  postId,
  userId,
  userName,
  userAvatar,
  timeAgo,
  sharedProfileType,
  sharedProfileId,
  onDeletePost
}) => {
  const { t } = useLanguage();
  const { showNotification } = useNotificationContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user-posts/shared-profile/${sharedProfileType}/${sharedProfileId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching shared profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sharedProfileType && sharedProfileId) {
      fetchProfileData();
    }
  }, [sharedProfileType, sharedProfileId]);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return avatar7.src || avatar7;
    if (photoUrl.startsWith('/uploads/') || photoUrl.startsWith('uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
      return `${apiBaseUrl}${normalizedPath}`;
    }
    return photoUrl;
  };

  const getProfileLink = () => {
    if (sharedProfileType === 'scholar') {
      return `/profile/scholar/${sharedProfileId}`;
    }
    return `/profile/user/${sharedProfileId}`;
  };

  // Check if this is the current user's post
  const isOwnPost = () => {
    const currentUserId = getUserIdFromToken();
    return currentUserId && currentUserId.toString() === userId.toString();
  };

  // Handle delete post
  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);

      // Call parent component's delete handler
      if (onDeletePost) {
        await onDeletePost(postId);

        showNotification({
          title: t('post.deleteSuccess'),
          message: t('post.deleteSuccessDesc'),
          variant: 'success'
        });
      } else {
        throw new Error('No delete handler provided');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification({
        title: t('post.deleteError'),
        message: t('post.deleteErrorDesc'),
        variant: 'danger'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="border-0 pb-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar avatar-story me-2">
              {userId ? (
                <Link href={`/profile/user/${userId}`}>
                  <Image
                    className="avatar-img rounded-circle"
                    src={getImageUrl(userAvatar)}
                    alt={userName}
                    width={48}
                    height={48}
                    onError={(e) => {
                      e.target.src = avatar7.src;
                    }}
                  />
                </Link>
              ) : (
                <Image
                  className="avatar-img rounded-circle"
                  src={getImageUrl(userAvatar)}
                  alt={userName}
                  width={48}
                  height={48}
                  onError={(e) => {
                    e.target.src = avatar7.src;
                  }}
                />
              )}
            </div>
            <div>
              <div className="nav nav-divider">
                <h6 className="nav-item card-title mb-0">
                  {userId ? (
                    <Link href={`/profile/user/${userId}`}> {userName} </Link>
                  ) : (
                    <span className="text-decoration-none"> {userName} </span>
                  )}
                </h6>
              </div>
              <p className="mb-0 small">{timeAgo}</p>
            </div>
          </div>

          {/* Three dots menu - only show for own posts */}
          {isOwnPost() && (
            <Dropdown>
              <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none">
                <BsThreeDots />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteConfirm(true);
                  }}
                  className="text-danger"
                >
                  <BsTrash size={22} className="fa-fw pe-2" />
                  {t('post.removeShare')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </CardHeader>

      <CardBody className="pb-0">
        <p className="mb-3">
          <BsPersonFill className="me-2" />
          {t('post.sharedProfile')}
        </p>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : profileData ? (
          sharedProfileId ? (
            <Link href={getProfileLink()} className="text-decoration-none">
              <Card className="bg-light border">
                <CardBody className="p-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-xl me-3">
                      <Image
                        className="avatar-img rounded-circle"
                        src={getImageUrl(profileData.photoUrl)}
                        alt={profileData.name}
                        width={64}
                        height={64}
                        onError={(e) => {
                          e.target.src = avatar7.src;
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0 d-flex align-items-center">
                        {profileData.name}
                        <BsPatchCheckFill className="text-success small ms-1" />
                      </h6>
                      {profileData.username && (
                        <p className="small text-muted mb-0">@{profileData.username}</p>
                      )}
                      {profileData.type === 'scholar' && (
                        <p className="small text-muted mb-0">
                          {profileData.birthDate} - {profileData.deathDate || t('profileStatus.today')}
                        </p>
                      )}
                      {profileData.biography && (
                        <p className="small text-muted mb-0 mt-2 line-clamp-2">
                          {profileData.biography.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {profileData.biography.length > 100 && '...'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ) : (
            <div className="text-decoration-none">
              <Card className="bg-light border">
                <CardBody className="p-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-xl me-3">
                      <Image
                        className="avatar-img rounded-circle"
                        src={getImageUrl(profileData.photoUrl)}
                        alt={profileData.name}
                        width={64}
                        height={64}
                        onError={(e) => {
                          e.target.src = avatar7.src;
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0 d-flex align-items-center">
                        {profileData.name}
                        <BsPatchCheckFill className="text-success small ms-1" />
                      </h6>
                      {profileData.username && (
                        <p className="small text-muted mb-0">@{profileData.username}</p>
                      )}
                      {profileData.type === 'scholar' && (
                        <p className="small text-muted mb-0">
                          {profileData.birthDate} - {profileData.deathDate || t('profileStatus.today')}
                        </p>
                      )}
                      {profileData.biography && (
                        <p className="small text-muted mb-0 mt-2 line-clamp-2">
                          {profileData.biography.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {profileData.biography.length > 100 && '...'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )
        ) : (
          <div className="alert alert-warning mb-0">
            {t('post.profileNotFound')}
          </div>
        )}
      </CardBody>

      {/* Delete Confirmation Dialog */}
      <CustomConfirmDialog
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePost}
        title={t('post.deletePost')}
        message={t('post.deletePostConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        loading={isDeleting}
      />
    </Card >
  );
};

export default SharedProfileCard;

