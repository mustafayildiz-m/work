'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import { useBooks } from '@/hooks/useBooks';
import Image from 'next/image';
import { Spinner, Alert } from 'react-bootstrap';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

export default function BookSlider({ selectedLanguageId, languageCode, languageName }) {
  const { books, loading, error } = useBooks(selectedLanguageId);

  const getBookImage = (book) => {
    // Backend'den gelen coverImage veya coverUrl'i kullan
    if (book.coverImage) {
      return book.coverImage.startsWith('http') ? book.coverImage : `${process.env.NEXT_PUBLIC_API_URL}${book.coverImage}`;
    }
    if (book.coverUrl) {
      return book.coverUrl.startsWith('http') ? book.coverUrl : `${process.env.NEXT_PUBLIC_API_URL}${book.coverUrl}`;
    }
    // Default kitap resmi
    return '/images/book-placeholder.jpg';
  };

  // Kitap detay URL'ini oluştur
  const getBookDetailUrl = (bookId) => {
    if (selectedLanguageId && languageCode && languageName) {
      const params = new URLSearchParams({
        languageId: selectedLanguageId,
        languageCode,
        languageName
      });
      return `/feed/books/${bookId}?${params.toString()}`;
    }
    return `/feed/books/${bookId}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Kitaplar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Hata!</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!books || books.length === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>Kitap Bulunamadı</Alert.Heading>
        <p>Henüz hiç kitap eklenmemiş.</p>
      </Alert>
    );
  }

  return (
    <div className="px-4 py-8 overflow-visible">
      <Swiper
        effect="coverflow"
        slidesPerView={2}
        spaceBetween={20}
        grabCursor={true}
        centeredSlides={true}
        loop={books.length > 3}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 2.5,
          slideShadows: false,
        }}
        modules={[EffectCoverflow]}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="w-full max-w-6xl mx-auto overflow-visible"
      >
        {books.map((book, index) => (
          <SwiperSlide
            key={book.id || index}
            className="w-[250px] h-[360px] rounded-xl overflow-hidden shadow-lg bg-white"
          >
            <Link href={getBookDetailUrl(book.id)}>
              <Image
                width={250}
                height={360}
                src={getBookImage(book)}
                alt={book.title || 'Kitap'}
                className="w-full h-full object-cover cursor-pointer"
                onError={(e) => {
                  e.target.src = '/images/book-placeholder.jpg';
                }}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
