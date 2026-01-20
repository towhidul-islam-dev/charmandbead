"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, ArrowLeft, Send, Loader2, CheckCircle2, Camera, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { UploadDropzone } from "@uploadthing/react"; // 💡 Added for uploads

function ReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("orderId");
  const productImg = searchParams.get("img"); // Original product image

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [userImageUrl, setUserImageUrl] = useState(""); // 💡 Stores the customer's uploaded photo
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please pick a star rating!");
    
    setLoading(true);
    try {
      const res = await fetch("/api/users/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          description: comment, 
          rating: rating,
          // 💡 Use user's upload if available, otherwise fallback to product image
          imageUrl: userImageUrl || productImg || "/placeholder.png", 
          isFeatured: false 
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Review submitted with photo!");
        setTimeout(() => router.push(`/dashboard/orders/${orderId}`), 2000);
      } else {
        toast.error("Error saving review.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-24 h-24 bg-[#EA638C]/10 rounded-full flex items-center justify-center text-[#EA638C] mb-6">
          <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Review Submitted</h2>
        <p className="text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mt-2">Redirecting to your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-12 pb-24 px-6">
      <Link href={`/dashboard/orders/${orderId}`} className="group inline-flex items-center gap-2 mb-10 text-[10px] font-black tracking-widest text-gray-400 uppercase hover:text-[#EA638C] transition-all">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Order
      </Link>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase italic leading-none">Share the Love</h1>
          <div className="h-1.5 w-12 bg-[#EA638C] mt-4 rounded-full mx-auto md:mx-0" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* PHOTO UPLOAD SECTION */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] flex items-center gap-2">
              <Camera size={12} /> Show it off (Optional)
            </label>
            
            {userImageUrl ? (
              <div className="relative w-full h-48 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-inner">
                <Image src={userImageUrl} fill className="object-cover" alt="User upload" />
                <button 
                  type="button"
                  onClick={() => setUserImageUrl("")}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-white shadow-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <UploadDropzone 
                endpoint="imageUploader" 
                onClientUploadComplete={(res) => {
                  setUserImageUrl(res[0].url);
                  toast.success("Photo added!");
                }}
                className="ut-button:bg-[#EA638C] ut-label:text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 py-10"
              />
            )}
          </div>

          {/* STAR RATING SELECTOR */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Rate your experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-all duration-200 hover:scale-125 active:scale-90"
                >
                  <Star
                    size={36}
                    strokeWidth={1.5}
                    className={`transition-all duration-300 ${
                      star <= (hover || rating) 
                        ? "fill-[#EA638C] text-[#EA638C] drop-shadow-[0_0_8px_rgba(234,99,140,0.3)]" 
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-4 text-[10px] font-black text-gray-900 self-center bg-gray-50 px-3 py-1 rounded-full border">
                {rating > 0 ? `${rating} / 5` : "0 / 5"}
              </span>
            </div>
          </div>

          {/* COMMENT BOX */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Your Thoughts</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What makes this product special?"
              className="w-full bg-gray-50 border-none rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-[#EA638C]/10 transition-all outline-none resize-none"
            />
          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full relative group overflow-hidden disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-3 py-6 bg-black text-white rounded-[2.5rem] transition-all duration-500 group-hover:bg-[#EA638C] shadow-xl active:scale-95">
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="text-[12px] font-black uppercase tracking-[0.25em]">Submit Review</span>
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center font-black text-[#EA638C] animate-pulse">PREPARING FORM...</div>}>
      <ReviewForm />
    </Suspense>
  );
}