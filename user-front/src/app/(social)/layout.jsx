import TopHeader from '@/components/layout/TopHeader';
import AuthProtectionWrapper from '@/components/wrappers/AuthProtectionWrapper';

const SocialLayout = ({
  children
}) => {
  return (
    <AuthProtectionWrapper>
      <TopHeader />
      {children}
    </AuthProtectionWrapper>
  );
};

export default SocialLayout;