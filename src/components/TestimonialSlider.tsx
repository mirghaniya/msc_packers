import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

type Testimonial = {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
};

const fallbackTestimonials: Testimonial[] = [
  { id: "f1", customer_name: "Bhandari Traders", content: "The quality of these jewelry packages exceeded my expectations. My customers are always impressed!", rating: 5 },
  { id: "f2", customer_name: "INDRA Jewellers", content: "Outstanding service and beautiful products. These display stands have transformed our showroom.", rating: 5 },
  { id: "f3", customer_name: "Bangard Jewellers", content: "Perfect packaging solutions for our boutique. The attention to detail is remarkable.", rating: 5 },
  { id: "f4", customer_name: "Shubh Laxmi", content: "Professional quality at competitive prices. We've been ordering from them for years.", rating: 5 },
  { id: "f5", customer_name: "Geetanjali Gold", content: "The gift boxes are absolutely stunning. Our customers love the premium feel.", rating: 5 },
  { id: "f6", customer_name: "Narayani Ghane", content: "Exceptional craftsmanship and elegant designs. Highly recommended for any jewelry business.", rating: 5 },
];

export const TestimonialSlider = () => {
  const { data } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, customer_name, content, rating")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const testimonials = data && data.length > 0 ? data : fallbackTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (currentIndex >= testimonials.length) setCurrentIndex(0);
  }, [testimonials.length, currentIndex]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const active = testimonials[currentIndex] ?? testimonials[0];

  return <section className="py-20 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair font-bold text-4xl md:text-5xl text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers worldwide
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="border-border shadow-elegant">
            <CardContent className="p-8 md:p-12 shadow-2xl rounded-2xl">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(active.rating)].map((_, i) => <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />)}
                </div>
                <p className="font-inter text-lg md:text-xl text-foreground mb-6 italic">
                  "{active.content}"
                </p>
                <p className="font-playfair font-semibold text-xl text-primary">
                  {active.customer_name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 md:-ml-16">
            <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-card shadow-soft hover:shadow-elegant transition-all" aria-label="Previous testimonial">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 md:-mr-16">
            <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-card shadow-soft hover:shadow-elegant transition-all" aria-label="Next testimonial">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-8 space-x-1">
            {testimonials.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 p-2 box-content rounded-full transition-all duration-300 bg-clip-content ${index === currentIndex ? "bg-primary w-8" : "bg-muted hover:bg-primary/50"}`} aria-label={`Go to testimonial ${index + 1}`} />)}
          </div>
        </div>
      </div>
    </section>;
};
