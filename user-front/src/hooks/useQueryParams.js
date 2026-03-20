'use client';

import { useSearchParams } from 'next/navigation';
const useQueryParams = () => {
  const searchParams = useSearchParams();
  // Object.fromEntries Chrome 73+, eski Android için reduce kullan
  return [...searchParams].reduce((acc, [k, v]) => {
    acc[k] = v;
    return acc;
  }, {});
};
export default useQueryParams;