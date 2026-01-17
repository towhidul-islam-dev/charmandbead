// app/page.js (Homepage)
import { getFeaturedReviews } from "@/actions/review";
import { getAllReviews } from "@/actions/review";
import ReviewCarousel from "@/components/home/ReviewCarousel";

export default async function HomePage() {
  const { reviews } = await getFeaturedReviews();

  return (
    <section className="py-20 bg-white">
      <div>
        <ReviewCarousel reviews={reviews} />
      </div>
      <div className="px-4 mx-auto max-w-7xl">
        <h2 className="mb-12 text-3xl font-bold text-center">What Our Clients Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((r) => (
            <div key={r._id} className="p-6 border rounded-2xl">
              <img src={r.imageUrl} className="object-cover w-full h-48 mb-4 rounded-xl" />
              <p className="italic text-gray-600">"{r.description}"</p>
              <div className="mt-4 font-bold text-brand-primary">⭐⭐⭐⭐⭐</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}