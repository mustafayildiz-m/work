'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import { bookData } from './data';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

export default function BookSlider() {
  return (
    <div className="px-4 py-8 overflow-visible">
      <Swiper
        effect="coverflow"
        slidesPerView={2}
        spaceBetween={20}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
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
        {bookData.map((book, index) => (
          <SwiperSlide
            key={index}
            className="w-[250px] h-[360px] rounded-xl overflow-hidden shadow-lg bg-white"
          >
            <Image
              width={200}
              height={300}
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
