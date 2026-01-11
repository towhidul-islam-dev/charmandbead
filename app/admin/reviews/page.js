"use client";

import { useState, useEffect } from "react";
import { createReview, getAllReviews, deleteReview } from "@/actions/review";
import { UploadDropzone } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
import { TrashIcon, StarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function AdminReviewPage() {
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const res = await getAllReviews();
        // Server actions return plain objects; ensure we handle the response correctly
        if (res.success) {
            setReviews(res.reviews);
        }
    };

    // Filter reviews based on search input
    const filteredReviews = reviews.filter((review) =>
        review.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageUrl) return alert("Please upload an image first.");

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("description", description);
        formData.append("imageUrl", imageUrl);
        formData.append("isFeatured", isFeatured);

        const res = await createReview(formData);
        
        if (res.success) {
            alert("Review published!");
            setDescription("");
            setImageUrl("");
            setIsFeatured(false);
            fetchReviews(); 
        } else {
            alert(res.error || "Failed to publish");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this review?")) {
            const res = await deleteReview(id);
            if (res.success) {
                fetchReviews();
            } else {
                alert(res.error);
            }
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Review Management</h1>
                    <p className="text-gray-500 text-sm">Create and showcase customer success stories.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </header>
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* --- FORM COLUMN --- */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Story</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Customer Image</label>
                            {imageUrl ? (
                                <div className="relative w-full h-48 border rounded-lg overflow-hidden group shadow-inner">
                                    <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setImageUrl("")}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200"
                                    >
                                        <div className="bg-white p-2 rounded-full text-red-600">
                                            <TrashIcon className="w-6 h-6" />
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => setImageUrl(res[0].url)}
                                    onUploadError={(error) => alert(`Upload Error: ${error.message}`)}
                                    className="ut-label:text-indigo-600 ut-button:bg-indigo-600 border-dashed border-2 border-gray-100 py-6"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                                placeholder="Write the customer's testimonial..."
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition" onClick={() => setIsFeatured(!isFeatured)}>
                            <input 
                                type="checkbox" 
                                checked={isFeatured}
                                onChange={() => {}} // Controlled by div click
                                className="w-5 h-5 text-indigo-600 rounded border-gray-300 pointer-events-none"
                            />
                            <span className="text-sm font-bold text-indigo-900 uppercase tracking-tight">
                                Feature on Homepage
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !imageUrl}
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 transition-all shadow-lg active:scale-95"
                        >
                            {isSubmitting ? "Processing..." : "Publish Review"}
                        </button>
                    </form>
                </div>

                {/* --- TABLE COLUMN --- */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[10px] uppercase font-black text-gray-400">
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Feedback</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20 text-gray-400 text-sm italic">
                                            {searchQuery ? "No matches found." : "No reviews available yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReviews.map((review) => (
                                        <tr key={review._id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4">
                                                <img src={review.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" alt="" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 line-clamp-2 max-w-sm">"{review.description}"</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {review.isFeatured ? (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-black uppercase">
                                                        <StarIconSolid className="w-3 h-3" /> Featured
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Standard</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(review._id)}
                                                    className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}