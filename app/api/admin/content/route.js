import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { FAQ, Policy } from "@/models/content";

// 🟢 GET: Load all FAQs and Policies
export async function GET() {
    try {
        await connectDB();
        const faqs = await FAQ.find().sort({ order: 1 });
        const policies = await Policy.find();
        
        return NextResponse.json({ faqs, policies }, { status: 200 });
    } catch (error) {
        console.error("GET ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
    }
}

// 🟢 POST: Sync Content (Bulk Update Logic)
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { category, data } = body;

        // --- FAQ Sync Logic ---
        if (category === "FAQ") {
            await FAQ.deleteMany({});
            
            // Ensure data is an array before mapping
            const faqList = Array.isArray(data) ? data : [];
            const formattedFaqs = faqList.map((item, index) => ({
                ...item,
                order: item.order ?? index 
            }));
            
            const savedFaqs = await FAQ.insertMany(formattedFaqs);
            return NextResponse.json({ message: "FAQs synced", data: savedFaqs }, { status: 200 });
        }

        // --- Policy Sync Logic (Terms, Refund, Privacy, Shipping) ---
        if (category === "Policy") {
            // Safety check: ensure 'data' exists to avoid Object.entries crash
            if (!data || typeof data !== 'object') {
                return NextResponse.json({ error: "Invalid policy data" }, { status: 400 });
            }

            const policiesArray = Object.entries(data).map(([type, content]) => ({
                type: type.toLowerCase(),
                content_en: content?.content_en || "",
                content_bn: content?.content_bn || "",
                updatedAt: new Date()
            }));

            // 1. Wipe the Policy collection
            await Policy.deleteMany({});
            
            // 2. Insert the fresh set of policies (only if there's data)
            let savedPolicies = [];
            if (policiesArray.length > 0) {
                savedPolicies = await Policy.insertMany(policiesArray);
            }

            return NextResponse.json({ 
                message: "Policies synced successfully", 
                data: savedPolicies 
            }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid Category" }, { status: 400 });
    } catch (error) {
        console.error("POST API ERROR:", error);
        return NextResponse.json({ 
            error: error.message || "Internal Server Error" 
        }, { status: 500 });
    }
}

// 🟢 DELETE: Handler for single FAQ ID deletion
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const category = searchParams.get("category");

        if (category === "FAQ" && id) {
            await FAQ.findByIdAndDelete(id);
            return NextResponse.json({ message: "Item deleted" }, { status: 200 });
        }

        return NextResponse.json({ error: "Missing ID or Category" }, { status: 400 });
    } catch (error) {
        console.error("DELETE ERROR:", error);
        return NextResponse.json({ error: "Delete operation failed" }, { status: 500 });
    }
}