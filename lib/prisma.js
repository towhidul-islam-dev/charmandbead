// lib/prisma.js (Example)




import mongodb from "../lib/mongodb";
import { NextResponse } from 'next/server';

export async function GET(){
    const conn = await mongodb.connect();

    return new NextResponse('connected');
}