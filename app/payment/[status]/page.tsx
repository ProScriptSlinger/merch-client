"use client";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button"; // Replace with your button component

type PaymentStatus = "success" | "failure" | "pending" | "unknown";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("unknown");
  const [isLoading, setIsLoading] = useState(true);

  // Extract status from URL (e.g., /payment/success?id=123)
  const paymentStatus = params?.status as string;
  const paymentId = searchParams.get("id");

  useEffect(() => {
    if (!paymentStatus) {
      router.push("/"); // Redirect if no status provided
      return;
    }

    // Validate and set status
    const validStatuses: PaymentStatus[] = ["success", "failure", "pending"];
    if (validStatuses.includes(paymentStatus as PaymentStatus)) {
      setStatus(paymentStatus as PaymentStatus);
      verifyPaymentOnBackend(paymentId); // Optional: Double-check with your backend
    } else {
      setStatus("unknown");
    }

    setIsLoading(false);
  }, [paymentStatus, paymentId, router]);

  const verifyPaymentOnBackend = async (id: string | null) => {
    if (!id) return;

    try {
      const response = await fetch(`/api/payments?id=${id}`);
      const data = await response.json();
      if (data.status !== status) {
        setStatus(data.status); // Sync with backend status
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Checking payment status...</p>
      </div>
    );
  }

  const statusConfig = {
    success: {
      icon: <CheckCircle className="w-16 h-16 text-white" />,
      title: "¡Listo, tu pedido está confirmado!",
      description: "Nos vemos en el evento. Mostrá tu QR para retirar tu merch de KHEA.",
      buttonText: "Ver pedido",
      action: () => router.push("/my-qr"),
    },
    failure: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "¡Ups, tu pago no fue confirmado!",
      description: "Por favor, intentá nuevamente.",
      buttonText: "Intentar nuevamente",
      action: () => router.push("/orders"),
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-500" />,
      title: "¡Tu pago está siendo procesado!",
      description:
        "Te notificaremos cuando el pago sea confirmado.",
      buttonText: "Verificar estado",
      action: () => verifyPaymentOnBackend(paymentId),
    },
    unknown: {
      icon: null,
      title: "Unknown Status",
      description: "We couldn't determine your payment status.",
      buttonText: "Contact Support",
      action: () => router.push("/catalog"),
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="flex flex-col items-center justify-center p-4 h-[calc(100vh-9rem)]">
      <div className="max-w-md w-full bg-black dark:bg-[#141415] rounded-lg shadow-lg p-8 text-center flex flex-col items-center">
        {currentStatus.icon}
        <h1 className="text-2xl font-bold mt-4">{currentStatus.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {currentStatus.description}
        </p>

        {paymentId && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Payment ID: {paymentId}
          </p>
        )}

        <Button
          onClick={currentStatus.action}
          className="mt-6 w-full"
          variant={status === "success" ? "default" : "outline"}
        >
          {currentStatus.buttonText}
        </Button>

        {status === "pending" && (
          <button
            onClick={() => router.refresh()}
            className="mt-3 text-sm text-gray-400 hover:underline"
          >
            Refresh page
          </button>
        )}
      </div>
    </div>
  );
}
