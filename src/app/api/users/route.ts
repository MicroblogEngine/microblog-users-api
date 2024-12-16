import { fakeUsers } from "@/db/users";
import { NextResponse } from "next/server";

export async function GET() {

    return new NextResponse(JSON.stringify(fakeUsers), {
        status: 200,
    });
}