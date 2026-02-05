import { Fragment, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserHero } from '@/partials/common/user-hero';
import { DropdownMenu9 } from '@/partials/dropdown-menu/dropdown-menu-9';
import { Navbar, NavbarActions } from '@/partials/navbar/navbar';
import {
  EllipsisVertical,
  Luggage,
  Mail,
  MapPin,
  MessageSquareText,
  Users,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { ProfileDefaultContent, CoverImageDialog } from '.';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreatePost } from '@/components/Post/CreatePost';
import { PostList } from '@/components/Post/PostList';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/scholars`;

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(BASE_URL)) return url;
  return BASE_URL.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
}

function getCity(locationName) {
  if (!locationName) return '';
  const parts = locationName.split(',').map(s => s.trim());
  return parts[0] || '';
}

function getAge(birthDate, deathDate) {
  if (!birthDate) return '';
  
  // Convert Hijri dates to numbers
  const birth = parseInt(birthDate);
  const death = deathDate ? parseInt(deathDate) : null;
  
  if (isNaN(birth)) return '';
  
  // If death date exists, calculate age at death
  if (death && !isNaN(death)) {
    return death - birth;
  }
  
  // If no death date, calculate current age
  const currentHijriYear = new Date().getFullYear() - 579; // Approximate conversion to Hijri year
  return currentHijriYear - birth;
}

export function ProfileDefaultPage() {
  const { id } = useParams();
  const [scholar, setScholar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverImageDialogOpen, setCoverImageDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [refreshPosts, setRefreshPosts] = useState(0);

  useEffect(() => {
    const fetchScholar = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch scholar data');
        }
        
        const data = await response.json();
        setScholar(data);
      } catch (error) {
        console.error('Error fetching scholar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholar();
  }, [id]);

  const handleCoverImageUpload = async (file) => {
    try {
      setUploadingCover(true);
      const token = localStorage.getItem('access_token');
      
      const formData = new FormData();
      formData.append('coverImage', file);

      const response = await fetch(`${API_URL}/${id}/cover-image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload cover image');
      }

      const result = await response.json();
      
      // Update the scholar state with the new cover image
      setScholar(prev => ({
        ...prev,
        coverImage: result.coverImage || result.coverImageUrl
      }));

      // Close the dialog
      setCoverImageDialogOpen(false);
      
      // Show success message
      alert('Kapak resmi başarıyla güncellendi!');
      
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Kapak resmi yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const image = (
    <img
      src={scholar?.photoUrl ? getImageUrl(scholar.photoUrl) : toAbsoluteUrl('/media/avatars/300-1.png')}
      className="rounded-full border-3 border-green-500 size-[100px] shrink-0"
      alt={scholar?.fullName || "Scholar"}
    />
  );

  const info = [
    { label: scholar?.lineage, icon: Users },
    { label: getCity(scholar?.locationName), icon: MapPin },
    { label: scholar?.birthDate ? `Vefat Yaşı: ${getAge(scholar.birthDate, scholar.deathDate)}` : '', icon: null },
    ...(scholar?.email ? [{ email: `mailto:${scholar.email}`, icon: Mail }] : []),
  ].filter(item => item.label || item.email);

  return (
    <Fragment>
      <div className="mb-4 flex">
        <Button variant="outline" onClick={() => navigate('/alimler/liste')}>
          ← Alimler Listesine Geri Dön
        </Button>
      </div>
      
      <UserHero
        name={scholar?.fullName || "Loading..."}
        image={image}
        info={info}
        coverImage={scholar?.coverImage ? getImageUrl(scholar.coverImage) : null}
        onCoverImageEdit={() => setCoverImageDialogOpen(true)}
        showEditButton={true}
      />

      <Container>
        <Navbar>
          <NavbarActions>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="post">Gönderiler</TabsTrigger>
              </TabsList>
            </Tabs>
          </NavbarActions>
        </Navbar>
      </Container>

      {/* Tab içerikleri */}
      {activeTab === 'profile' && (
        <Container>
          <ProfileDefaultContent scholar={scholar} loading={loading} />
        </Container>
      )}
      {activeTab === 'post' && (
        <Container>
          <CreatePost
            scholarId={id}
            onPostCreated={() => setRefreshPosts(prev => prev + 1)}
          />
          <PostList scholarId={id} refreshKey={refreshPosts} />
        </Container>
      )}

      {/* Cover Image Upload Dialog */}
      <CoverImageDialog
        open={coverImageDialogOpen}
        onOpenChange={setCoverImageDialogOpen}
        onImageUpload={handleCoverImageUpload}
        loading={uploadingCover}
      />
    </Fragment>
  );
}
