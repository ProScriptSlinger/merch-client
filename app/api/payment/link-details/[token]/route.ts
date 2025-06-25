import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request, { params }: { params: { token: string } }) {
    const { token } = params;

  try {
    // Generate unique token
    const { data, error } = await supabase
      .from('payment_links')
      .select("*")
      .eq('token', token)
      .single();
    console.log("link details data ------>", data)
    if (error) throw error;
    
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}