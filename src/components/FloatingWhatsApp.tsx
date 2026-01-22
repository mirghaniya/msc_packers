import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

const WHATSAPP_NUMBER = "918851882465";

export const FloatingWhatsApp = () => {
  const handleClick = () => {
    const message = encodeURIComponent("Hi, I would like to know more about your products.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </Button>
  );
};
