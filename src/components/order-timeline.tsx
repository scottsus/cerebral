"use client";

import { Check, Clock, Flag, XCircle } from "lucide-react";
import { Card } from "~/components/ui/card";

interface TimelineEvent {
  status: string;
  date: Date;
  description: string;
}

export function OrderTimeline({
  status,
  createdAt,
  updatedAt,
}: {
  status: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}) {
  const events: TimelineEvent[] = [
    {
      status: "CREATED",
      date: createdAt,
      description: "Order received via WhatsApp",
    },
  ];

  if (status === "COMPLETED") {
    events.push({
      status: "COMPLETED",
      date: updatedAt || createdAt,
      description: "Order completed and delivered",
    });
  } else if (status === "CANCELLED") {
    events.push({
      status: "CANCELLED",
      date: updatedAt || createdAt,
      description: "Order was cancelled",
    });
  } else if (status === "FLAGGED") {
    events.push({
      status: "FLAGGED",
      date: updatedAt || createdAt,
      description: "Order flagged for review",
    });
  }

  const getIcon = (eventStatus: string) => {
    switch (eventStatus) {
      case "CREATED":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "COMPLETED":
        return <Check className="w-5 h-5 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "FLAGGED":
        return <Flag className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getColor = (eventStatus: string) => {
    switch (eventStatus) {
      case "CREATED":
        return "border-blue-500";
      case "COMPLETED":
        return "border-green-500";
      case "CANCELLED":
        return "border-red-500";
      case "FLAGGED":
        return "border-yellow-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Order Timeline
      </h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="relative flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getColor(
                  event.status
                )} bg-white dark:bg-gray-800`}
              >
                {getIcon(event.status)}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {event.status === "CREATED"
                    ? "Order Created"
                    : event.status === "COMPLETED"
                    ? "Completed"
                    : event.status === "CANCELLED"
                    ? "Cancelled"
                    : event.status === "FLAGGED"
                    ? "Flagged"
                    : event.status}
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(event.date).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
