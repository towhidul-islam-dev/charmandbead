"use client";
import { useState, useEffect } from "react";
import { createReview, getAllReviews, deleteReview } from "@/actions/review";
import { UploadDropzone } from "@uploadthing/react";
import { TrashIcon, PlusIcon, StarIcon as StarOutline, PhotoIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function AdminReviewPage() {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // 🟢 New states for the form
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => { load(); }, []);
    
    const load = async () => {
        setLoading(true);
        const res = await getAllReviews();
        if (res.success) setReviews(res.reviews);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl) return toast.error("Please upload an image first");
        
        setLoading(true);
        const formData = new FormData();
        formData.append("imageUrl", imageUrl);
        formData.append("description", description || "New Customer Story");
        formData.append("isFeatured", false);
        
        const res = await createReview(formData);
        if (res.success) {
            toast.success("Story Published!");
            // Reset form
            setImageUrl("");
            setDescription("");
            setShowForm(false);
            load();
        }
        setLoading(false);
    };

    return (
        <div className="relative w-full max-w-5xl px-4 mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl italic font-black tracking-tight text-gray-900 uppercase">
                        Social <span className="text-indigo-600">Proof</span>
                    </h1>
                    <p className="text-sm font-medium text-gray-500">Manage your customer gallery</p>
                </div>
                
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
                        showForm ? "bg-gray-100 text-gray-600" : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700"
                    }`}
                >
                    {showForm ? "Close" : <><PlusIcon className="w-5 h-5" /> Add Story</>}
                </button>
            </div>

            {/* Upload & Text Form */}
            {showForm && (
                <div className="p-8 mb-10 bg-white border border-gray-100 shadow-2xl rounded-[2rem] animate-in fade-in zoom-in duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Step 1: Upload Media</label>
                            {imageUrl ? (
                                <div className="relative w-full h-48 overflow-hidden border-2 rounded-2xl border-indigo-50">
                                    <img src={imageUrl} className="object-cover w-full h-full" alt="Preview" />
                                    <button 
                                        type="button" 
                                        onClick={() => setImageUrl("")}
                                        className="absolute p-2 text-red-500 rounded-full shadow-sm top-2 right-2 bg-white/90 backdrop-blur"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <UploadDropzone 
                                    endpoint="imageUploader" 
                                    onClientUploadComplete={(res) => setImageUrl(res[0].url)}
                                    className="py-10 border-2 border-gray-100 border-dashed ut-button:bg-indigo-600 rounded-2xl"
                                />
                            )}
                        </div>

                        {/* 🟢 NEW TEXT FIELD UNDERNEATH */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Step 2: Customer Feedback</label>
                            <div className="relative">
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Write what the customer said about your product..."
                                    className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-sm italic text-gray-700"
                                />
                                <ChatBubbleBottomCenterTextIcon className="absolute w-5 h-5 text-gray-300 left-4 top-4" />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !imageUrl}
                            className="w-full py-4 font-black tracking-widest text-white uppercase transition-all bg-indigo-600 shadow-lg rounded-2xl hover:bg-indigo-700 disabled:bg-gray-200 shadow-indigo-100"
                        >
                            {loading ? "Publishing..." : "Publish Review"}
                        </button>
                    </form>
                </div>
            )}

            {/* List View */}
            <div className="grid grid-cols-1 gap-4">
                {reviews.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                        <PhotoIcon className="w-12 h-12 mb-2 text-gray-300" />
                        <p className="font-medium text-gray-500">No stories found. Add one above!</p>
                    </div>
                )}

                {reviews.map((r) => (
                    <div 
                        key={r._id} 
                        className="flex items-center gap-4 p-3 transition-all bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-md"
                    >
                        <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden sm:w-24 sm:h-24 rounded-xl">
                            <img src={r.imageUrl} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Customer Story</span>
                            <p className="text-sm italic font-medium leading-relaxed text-gray-600 line-clamp-2">
                                "{r.description}"
                            </p>
                        </div>

                        <div className="flex items-center gap-1 pr-2">
                            <button 
                                onClick={() => deleteReview(r._id).then(load)} 
                                className="p-3 text-gray-300 transition-all hover:text-red-500 hover:bg-red-50 rounded-xl"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}