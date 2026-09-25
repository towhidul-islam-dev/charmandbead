"use client";

import { useState } from "react";
import { createSlide, updateSlide, deleteSlide } from "@/actions/sliderActions";
import { Plus, Trash2, Edit3, X, Globe, Sparkles } from "lucide-react";

export default function AdminSlidersClient({ initialSlides }) {
  const [editingSlide, setEditingSlide] = useState(null);

  const handleEditClick = (slide) => {
    setEditingSlide({
      ...slide,
      _id: slide._id.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingSlide(null);
  };

  const handleDelete = async (slideId) => {
    await deleteSlide(slideId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA638C]/10 text-[#EA638C] text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles size={12} /> Content Control
          </div>
          <h1 className="text-3xl font-black text-[#3E442B] uppercase tracking-tighter italic">
            Bilingual Slider <span className="text-[#EA638C]">Manager</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create or Edit Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#3E442B] uppercase tracking-tight flex items-center gap-2">
              {editingSlide ? (
                <>
                  <Edit3 size={16} className="text-[#EA638C]" /> Edit Slide
                </>
              ) : (
                <>
                  <Plus size={16} className="text-[#EA638C]" /> Add New Slide
                </>
              )}
            </h2>
            {editingSlide && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-[#EA638C] transition-colors p-1 cursor-pointer"
                title="Cancel Edit"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form
            action={async (formData) => {
              if (editingSlide) {
                formData.append("id", editingSlide._id);
                await updateSlide(formData);
                setEditingSlide(null);
              } else {
                await createSlide(formData);
              }
            }}
            key={editingSlide ? editingSlide._id : "new-form"}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Badge (Optional)
              </label>
              <input
                type="text"
                name="badge"
                defaultValue={editingSlide?.badge || ""}
                placeholder="e.g. Just Dropped"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#3E442B] focus:outline-none focus:border-[#EA638C]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                English Title *
              </label>
              <input
                type="text"
                name="enTitle"
                required
                defaultValue={editingSlide?.enTitle || ""}
                placeholder="e.g. New Arrival: Premium Wholesale Beads"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#3E442B] focus:outline-none focus:border-[#EA638C]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Bangla Title (বাংলা শিরোনাম) *
              </label>
              <input
                type="text"
                name="bnTitle"
                required
                defaultValue={editingSlide?.bnTitle || ""}
                placeholder="e.g. নতুন আগমন: প্রিমিয়াম হোলসেল পুতি"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#3E442B] focus:outline-none focus:border-[#EA638C]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                English Subtitle *
              </label>
              <textarea
                name="enSubtitle"
                required
                rows={2}
                defaultValue={editingSlide?.enSubtitle || ""}
                placeholder="Brief description in English..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#3E442B] focus:outline-none focus:border-[#EA638C] resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Bangla Subtitle (বাংলা বিবরণ) *
              </label>
              <textarea
                name="bnSubtitle"
                required
                rows={2}
                defaultValue={editingSlide?.bnSubtitle || ""}
                placeholder="বাংলা বিবরণ লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#3E442B] focus:outline-none focus:border-[#EA638C] resize-none"
              />
            </div>

            <div className="flex gap-2">
              {editingSlide && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/3 py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-wider hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`${
                  editingSlide ? "w-2/3" : "w-full"
                } py-3 rounded-xl bg-[#3E442B] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#EA638C] transition-all duration-300 shadow-lg shadow-[#3E442B]/20 cursor-pointer flex items-center justify-center gap-2`}
              >
                {editingSlide ? (
                  <>Update Slide</>
                ) : (
                  <>
                    <Plus size={14} /> Publish Slide
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Existing Slides List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-[#3E442B] uppercase tracking-tight mb-4 flex items-center gap-2">
            <Globe size={16} className="text-[#EA638C]" /> Active Slides ({initialSlides.length})
          </h2>

          {initialSlides.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                No active slides found. Add your first slide using the form.
              </p>
            </div>
          ) : (
            initialSlides.map((slide) => {
              const slideIdStr = slide._id.toString();
              const isBeingEdited = editingSlide?._id === slideIdStr;

              return (
                <div
                  key={slideIdStr}
                  className={`bg-white p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isBeingEdited ? "border-[#EA638C] ring-2 ring-[#EA638C]/20 shadow-md" : "border-gray-100 shadow-sm hover:border-[#EA638C]/30"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    {slide.badge && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#EA638C]/10 text-[#EA638C] text-[9px] font-black uppercase tracking-widest">
                        {slide.badge}
                      </span>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#3E442B]">
                        <span className="text-gray-400 font-normal mr-2">EN:</span>
                        {slide.enTitle}
                      </p>
                      <p className="text-xs font-bold text-[#3E442B]">
                        <span className="text-gray-400 font-normal mr-2">BN:</span>
                        {slide.bnTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEditClick(slide)}
                      className="p-2.5 rounded-xl bg-gray-50 text-[#3E442B] hover:bg-[#3E442B] hover:text-white transition-colors cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(slideIdStr)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}