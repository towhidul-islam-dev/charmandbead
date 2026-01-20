"use client";
import { useState, useEffect } from "react";
import { createReview, getAllReviews, deleteReview, updateReview } from "@/actions/review";
import { UploadDropzone } from "@uploadthing/react";
import { TrashIcon, StarIcon as StarOutline, SparklesIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminReviewPage() {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [rating, setRating] = useState(5); // Default to 5 stars

    useEffect(() => { load(); }, []);
    
    const load = async () => {
        setLoading(true);
        try {
            const res = await getAllReviews();
            if (res.success) setReviews(res.reviews);
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl) return toast.error("Upload image first");
        
        setLoading(true);
        const formData = new FormData();
        formData.append("imageUrl", imageUrl);
        formData.append("description", description || "New Customer Story");
        formData.append("rating", rating.toString()); // Ensure rating is sent
        
        try {
            const res = await createReview(formData);
            if (res.success) {
                toast.success("Social proof published!");
                setImageUrl("");
                setDescription("");
                setRating(5);
                setShowForm(false);
                load();
            }
        } catch (error) {
            toast.error("Error saving to database");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-5xl px-4 py-10 mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl italic font-black text-gray-900 uppercase tracking-tighter">Social Proof</h1>
                    <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.3em] mt-1">Manage Testimonials</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                        showForm ? "bg-gray-100 text-gray-500" : "bg-black text-white shadow-xl shadow-gray-200"
                    }`}
                >
                    {showForm ? "Cancel" : "Add Story +"}
                </button>
            </div>

            {showForm && (
                <div className="p-10 mb-12 bg-white border border-gray-100 shadow-2xl rounded-[3rem] animate-in slide-in-from-top duration-500">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload Area */}
                        <div className="relative w-full h-72 overflow-hidden border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 flex items-center justify-center">
                            {imageUrl ? (
                                <>
                                    <Image src={imageUrl} fill unoptimized className="object-cover" alt="Preview" />
                                    <button onClick={() => setImageUrl("")} className="absolute p-3 text-white bg-red-500 rounded-2xl shadow-lg top-4 right-4 hover:scale-110 transition-transform">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <UploadDropzone 
                                    endpoint="imageUploader" 
                                    onClientUploadComplete={(res) => {
                                        setImageUrl(res[0].url);
                                        toast.success("Visual Ready!");
                                    }}
                                    className="ut-button:bg-[#EA638C] ut-label:text-gray-400 border-none"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Star Selector for Admin manual entry */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Story Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onClick={() => setRating(star)}>
                                            {star <= rating ? (
                                                <StarSolid className="w-8 h-8 text-[#EA638C]" />
                                            ) : (
                                                <StarOutline className="w-8 h-8 text-gray-200" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Write the customer's quote here..."
                                    className="w-full p-6 bg-gray-50 border-none rounded-[1.5rem] min-h-[120px] text-sm font-medium outline-none focus:ring-2 focus:ring-[#EA638C]/10 transition-all"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !imageUrl} className="w-full py-5 bg-black text-white font-black rounded-3xl uppercase tracking-[0.2em] text-xs hover:bg-[#EA638C] transition-all shadow-xl shadow-pink-100 disabled:opacity-30">
                            {loading ? "Saving to Database..." : "Publish to Website"}
                        </button>
                    </form>
                </div>
            )}

            {/* List of Reviews */}
            <div className="space-y-4">
                {reviews.map((r) => (
                    <div key={r._id} className={`flex items-center gap-6 p-4 bg-white border rounded-[2rem] transition-all ${r.isFeatured ? 'border-[#EA638C]/30 shadow-md shadow-pink-50' : 'border-gray-100 shadow-sm'}`}>
                        
                        <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-50 rounded-2xl border border-gray-50">
                            {r.imageUrl ? (
                                <Image 
                                    src={r.imageUrl} 
                                    fill 
                                    sizes="96px"
                                    className="object-cover" 
                                    alt="Review" 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-[10px] text-gray-300">NO IMAGE</div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <StarSolid key={i} className={`w-3 h-3 ${i < (r.rating || 5) ? 'text-[#EA638C]' : 'text-gray-100'}`} />
                                ))}
                                {r.isFeatured && (
                                    <span className="ml-2 flex items-center gap-1 text-[8px] font-black text-[#EA638C] uppercase bg-pink-50 px-2 py-0.5 rounded-full">
                                        <SparklesIcon className="w-2 h-2" /> Featured
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-gray-700 leading-snug line-clamp-2 italic">"{r.description}"</p>
                            <p className="text-[9px] font-mono text-gray-300 mt-2 truncate max-w-[200px]">{r._id}</p>
                        </div>

                        <div className="flex flex-col gap-2 pr-2">
                            <button 
                                onClick={() => updateReview(r._id, { isFeatured: !r.isFeatured }).then(load)} 
                                className={`p-3 rounded-xl transition-all ${r.isFeatured ? 'bg-[#EA638C] text-white' : 'bg-gray-50 text-gray-300 hover:text-black'}`}
                                title="Toggle Featured"
                            >
                                <StarSolid className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => deleteReview(r._id).then(load)} 
                                className="p-3 bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                title="Delete Review"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="text-center py-32 border-2 border-dashed border-gray-100 rounded-[3rem]">
                        <p className="font-black text-gray-200 uppercase tracking-[0.3em]">No Social Proof Yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}