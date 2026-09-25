import { getSlides } from "@/actions/sliderActions";
import AdminSlidersClient from "@/components/AdminSlidersClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { slides, success } = await getSlides();
  const activeSlides = success && slides ? slides : [];
  return <AdminSlidersClient initialSlides={activeSlides} />;
}