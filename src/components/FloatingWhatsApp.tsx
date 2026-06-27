import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "918851882465";
const DEFAULT_MESSAGE = "Hi, I would like to know more about your products.";

export const FloatingWhatsApp = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1"
      aria-label="Chat on WhatsApp"
    >
      <span className="px-2 py-0.5 rounded-full bg-white text-green-600 text-[11px] font-semibold shadow-md border border-green-100 animate-pulse">
        Chat now
      </span>
      <span className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
        <MessageCircle className="h-7 w-7 text-white" />
      </span>
    </a>
  );
};
