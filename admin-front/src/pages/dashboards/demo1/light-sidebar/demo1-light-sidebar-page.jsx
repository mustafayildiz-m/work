import { Container } from '@/components/common/container';
import { Helmet } from 'react-helmet-async';
import { Demo1LightSidebarContent } from './';

export function Demo1LightSidebarPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard - Islamic Windows Admin</title>
      </Helmet>
      
      <Container>
        <Demo1LightSidebarContent />
      </Container>
    </>
  );
}
