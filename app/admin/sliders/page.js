import dbConnect from "@/lib/mongodb";
import { getSlides, createSlide, deleteSlide } from "@/actions/sliderActions";
import { Plus, Trash2, Globe, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSlidersPage() {
  // Fetch slides using the server action
  const { slides, success } = await getSlides();
  const activeSlides = success && slides ? slides : [];

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
        {/* Left Column: Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 h-fit">
          <h2 className="text-base font-bold text-[#3E442B] uppercase tracking-tight mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#EA638C]" /> Add New Slide
          </h2>

          <form action={createSlide} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Badge (Optional)
              </label>
              <input
                type="text"
                name="badge"
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
                placeholder="বাংলা বিবরণ লিখুন..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#3E442B] focus:outline-none focus:border-[#EA638C] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#3E442B] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#EA638C] transition-all duration-300 shadow-lg shadow-[#3E442B]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Publish Slide
            </button>
          </form>
        </div>

        {/* Right Column: Existing Slides List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-[#3E442B] uppercase tracking-tight mb-4 flex items-center gap-2">
            <Globe size={16} className="text-[#EA638C]" /> Active Slides ({activeSlides.length})
          </h2>

          {activeSlides.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                No active slides found. Add your first slide using the form.
              </p>
            </div>
          ) : (
            activeSlides.map((slide) => (
              <div
                key={slide._id.toString()}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#EA638C]/30 transition-all"
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

                <form
                  action={async () => {
                    "use server";
                    await deleteSlide(slide._id.toString());
                  }}
                >
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}