import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

interface OrderTimelineProps {
  orderId: string;
  currentStatus: string;
  estimatedDeliveryDate?: string | null;
  orderCreatedAt: string;
}

const statusSteps = [
  { status: "Pending", label: "Order Placed", icon: Clock },
  { status: "Processing", label: "Processing", icon: Package },
  { status: "Shipped", label: "Shipped", icon: Truck },
  { status: "Delivered", label: "Delivered", icon: CheckCircle },
];

export const OrderTimeline = ({
  orderId,
  currentStatus,
  estimatedDeliveryDate,
  orderCreatedAt,
}: OrderTimelineProps) => {
  const { data: statusHistory } = useQuery({
    queryKey: ["order-status-history", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const getStatusIndex = (status: string) => {
    if (status === "Cancelled") return -1;
    return statusSteps.findIndex((s) => s.status === status);
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === "Cancelled";

  const getStatusTime = (status: string) => {
    if (status === "Pending") {
      return format(new Date(orderCreatedAt), "MMM d, yyyy h:mm a");
    }
    const historyEntry = statusHistory?.find((h) => h.status === status);
    return historyEntry
      ? format(new Date(historyEntry.created_at), "MMM d, yyyy h:mm a")
      : null;
  };

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3 text-red-600">
          <XCircle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Order Cancelled</p>
            <p className="text-sm text-red-500">
              This order has been cancelled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estimated Delivery */}
      {estimatedDeliveryDate && currentStatus !== "Delivered" && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Estimated Delivery</p>
          <p className="font-semibold text-primary">
            {format(new Date(estimatedDeliveryDate), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {statusSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const statusTime = getStatusTime(step.status);

          return (
            <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
              {/* Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[40px] ${
                      index < currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1.5">
                <p
                  className={`font-semibold ${
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {statusTime && isCompleted && (
                  <p className="text-sm text-muted-foreground">{statusTime}</p>
                )}
                {isCurrent && !statusTime && index > 0 && (
                  <p className="text-sm text-muted-foreground">In progress...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
