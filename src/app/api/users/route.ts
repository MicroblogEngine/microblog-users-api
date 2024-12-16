import { fakeUsers } from "@/src/app/db/users";
import { NextResponse } from "next/server";

export async function GET() {

    return new NextResponse(JSON.stringify(fakeUsers), {
        status: 200,
    });
}