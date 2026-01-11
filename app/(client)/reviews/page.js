// app/page.js (Homepage)
import { getFeaturedReviews } from "@/actions/review";

export default async function HomePage() {
  const { reviews } = await getFeaturedReviews();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <div key={r._id} className="border p-6 rounded-2xl">
              <img src={r.imageUrl} className="w-full h-48 object-cover rounded-xl mb-4" />
              <p className="text-gray-600 italic">"{r.description}"</p>
              <div className="mt-4 text-brand-primary font-bold">⭐⭐⭐⭐⭐</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}