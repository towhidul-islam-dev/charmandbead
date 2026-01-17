"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Quote, Star, ArrowLeft, ArrowRight } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function ReviewCarousel({ reviews }) {
  const featuredReviews = reviews.filter((r) => r.isFeatured);

  if (featuredReviews.length === 0) return null;

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      <div className="relative px-4 mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="relative z-20 flex flex-col justify-between gap-8 mb-16 md:flex-row md:items-end">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-pink-100 rounded-full bg-pink-50">
              <Star size={12} className="text-[#EA638C] fill-[#EA638C]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EA638C]">
                Creator Stories
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl italic font-black tracking-tighter text-[#3E442B] uppercase leading-none">
              Built with <br /> <span className="text-[#EA638C]">Charm & Bead</span>
            </h2>
          </div>

          {/* 🟢 NAVIGATION BUTTONS - Added z-50 and relative to ensure visibility */}
          <div className="relative z-50 flex gap-3">
            <button
              id="prev-btn"
              className="review-control-btn w-14 h-14 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center text-[#3E442B] hover:bg-[#3E442B] hover:text-white hover:border-[#3E442B] transition-all duration-300 shadow-sm active:scale-90 pointer-events-auto cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              id="next-btn"
              className="review-control-btn w-14 h-14 rounded-2xl bg-[#EA638C] flex items-center justify-center text-white hover:bg-[#3E442B] transition-all duration-300 shadow-lg shadow-pink-100 active:scale-90 pointer-events-auto cursor-pointer"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          navigation={{
            prevEl: "#prev-btn",
            nextEl: "#next-btn",
          }}
          observer={true}
          observeParents={true}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ 
            delay: 5000,
            disableOnInteraction: false 
          }}
          pagination={{ clickable: true, el: '.custom-pagination' }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="relative z-10 review-swiper"
        >
          {featuredReviews.map((review) => (
            <SwiperSlide key={review._id}>
              <div className="group relative bg-gray-50 rounded-[3rem] p-8 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-pink-100/50 border border-transparent hover:border-pink-50">
                <div className="relative mb-8 aspect-square overflow-hidden rounded-[2.5rem] border-4 border-white shadow-md rotate-[-1deg] group-hover:rotate-0 transition-all duration-500">
                  <img
                    src={review.imageUrl}
                    alt="Customer Project"
                    className="object-cover w-full h-full transition-transform duration-700 scale-110 group-hover:scale-100"
                  />
                  <div className="absolute p-3 shadow-sm top-5 left-5 bg-white/90 backdrop-blur-sm rounded-2xl">
                    <Quote size={20} className="text-[#EA638C] fill-[#EA638C]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xl font-bold italic leading-tight tracking-tight text-[#3E442B]">
                    "{review.description}"
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Verified Maker</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="relative z-20 flex justify-center gap-2 mt-12 custom-pagination"></div>
      </div>

      {/* 🟢 CRITICAL CSS OVERRIDES */}
      <style jsx global>{`
        /* Prevent Swiper from hiding your custom buttons */
        .review-control-btn.swiper-button-disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
          display: flex !important; /* Force them to stay visible */
        }
        
        /* Ensure buttons stay visible even if swiper thinks they should be hidden */
        #prev-btn, #next-btn {
          display: flex !important;
          visibility: visible !important;
        }

        .custom-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #3E442B;
          opacity: 0.15;
          border-radius: 99px;
          transition: all 0.3s ease;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          width: 32px;
          background: #EA638C;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}