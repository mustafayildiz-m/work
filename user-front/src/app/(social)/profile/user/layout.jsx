'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { children } from 'react';

const UserProfileLayout = ({ children }) => {
  // Bu layout sadece children'ı render eder
  // Profil bilgileri ana profile layout'ta zaten render ediliyor
  return <>{children}</>;
};

export default UserProfileLayout;
