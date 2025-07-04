import { type NextRequest, NextResponse } from "next/server";
import { PaymentWebhookData } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Common interface for payment data
interface PaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  installments: number;
  date_created: string;
  date_approved: string | null;
  external_reference?: string;
}

// Common function to fetch payment data
async function fetchPaymentData(paymentId: string): Promise<PaymentResponse> {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Payment not found or API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// Common function to transform payment data
function transformPaymentData(paymentData: PaymentResponse) {
  return {
    id: paymentData.id,
    status: paymentData.status,
    statusDetail: paymentData.status_detail,
    transactionAmount: Number(paymentData.transaction_amount),
    currencyId: paymentData.currency_id,
    paymentMethodId: paymentData.payment_method_id,
    installments: paymentData.installments,
    dateCreated: paymentData.date_created,
    dateApproved: paymentData.date_approved,
    paymentUrl: "", // Consider if this should be populated or removed
    externalId: paymentData.external_reference,
  };
}

export async function POST(request: NextRequest) {
  try {

    const data: PaymentWebhookData = await request.json();
    console.log("Webhook received:", data);
    if (
      (data.action === "payment.updated" ||
        data.action === "payment.created") &&
      data.data.id
    ) {
      const paymentData = await fetchPaymentData(data.data.id);
      const transformedData = transformPaymentData(paymentData);
      console.log("Payment data and Transformed payment data:", paymentData, transformedData);
      if (paymentData.status === "approved") {
        const { data: transactionUpdate, error: transactionError } =
          await supabase
            .from("transactions")
            .update({
              status: "approved",
            })
            .eq("id", transformedData.externalId)
            .select()
            .single();

        if (transactionUpdate?.order_id) {
          const { data: orderUpdate, error: orderError } = await supabase
            .from("orders")
            .update({
              status: "pending",
              payment_validated: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", transactionUpdate?.order_id)
            .select()
            .single();

          if (orderError) {
            console.error("Error updating order:", orderError);
            return NextResponse.json(
              {
                message: "An unexpected error occurred",
                error: orderError.message,
              },
              { status: 500 }
            );
          }
        }

        if (transactionError) {
          console.error("Error updating transaction:", transactionError);
          return NextResponse.json(
            {
              message: "An unexpected error occurred",
              error: transactionError.message,
            },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ status: 200 });
    }

    return NextResponse.json(
      { message: "No action taken - webhook not processed" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { message: "Payment ID is required" },
        { status: 400 }
      );
    }

    const paymentData = await fetchPaymentData(paymentId);
    const transformedData = transformPaymentData(paymentData);

    if (paymentData.status === "approved") {
      console.log("Payment approved", { paymentId: transformedData.id });
    }

    return NextResponse.json({ data: transformedData });
  } catch (err) {
    console.error("Payment fetch error:", err);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
