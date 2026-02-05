import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { CreatePost } from '../components/Post/CreatePost';
import { PostList } from '../components/Post/PostList';

export const Posts: React.FC = () => {
  // Bu kısım gerçek uygulamada authentication sisteminden gelecek
  const currentScholarId = "123"; // Örnek ID

  const handlePostCreated = () => {
    // Post oluşturulduğunda listeyi yenilemek için gerekli state güncellemesi
    // Bu kısım PostList bileşeninde useEffect ile otomatik olarak yapılıyor
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paylaşımlar
        </Typography>
        
        <CreatePost
          scholarId={currentScholarId}
          onPostCreated={handlePostCreated}
        />
        
        <PostList scholarId={currentScholarId} />
      </Box>
    </Container>
  );
}; 