"use client";

import { useState } from "react";
import { users } from "~/server/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { updateUser } from "~/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type User = InferSelectModel<typeof users>;

export default function SettingsClient({ user }: { user: User }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || "",
    businessName: user.businessName || "",
    phoneNumber: user.phoneNumber || "",
    businessDescription: user.businessDescription || "",
    welcomeMessage: user.welcomeMessage || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUser(user.id, formData);
      toast.success("Settings updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#2F2F2F] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <p className="mt-2 text-gray-400">
            Manage your business profile and preferences
          </p>
        </div>

        <div className="rounded-2xl border-2 border-[#575757] bg-[#2f2f2f] p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-white"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-[#575757] bg-[#2f2f2f] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f6f930] focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-medium text-white"
              >
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-[#575757] bg-[#2f2f2f] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f6f930] focus:outline-none"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-medium text-white"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-[#575757] bg-[#2f2f2f] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f6f930] focus:outline-none"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="businessDescription"
                className="mb-2 block text-sm font-medium text-white"
              >
                Business Description
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border-2 border-[#575757] bg-[#2f2f2f] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f6f930] focus:outline-none"
                placeholder="Describe your business"
              />
            </div>

            <div>
              <label
                htmlFor="welcomeMessage"
                className="mb-2 block text-sm font-medium text-white"
              >
                Welcome Message
              </label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border-2 border-[#575757] bg-[#2f2f2f] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f6f930] focus:outline-none"
                placeholder="Enter your WhatsApp welcome message"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-[#f6f930] px-6 py-2 font-semibold text-black hover:bg-[#e5e820] disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border-2 border-[#575757] bg-[#2f2f2f] px-6 py-2 font-semibold text-white hover:bg-[#3f3f3f]"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-8 border-t-2 border-[#575757] pt-6">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Account Information
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <span className="font-medium text-white">Email:</span>{" "}
                {user.email}
              </p>
              <p>
                <span className="font-medium text-white">User ID:</span>{" "}
                {user.id}
              </p>
              <p>
                <span className="font-medium text-white">
                  WhatsApp Status:
                </span>{" "}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.listenerStatus === "RUNNING"
                      ? "bg-green-900 text-green-200"
                      : user.listenerStatus === "INITIALIZING"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-red-900 text-red-200"
                  }`}
                >
                  {user.listenerStatus}
                </span>
              </p>
              <p>
                <span className="font-medium text-white">Joined:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
