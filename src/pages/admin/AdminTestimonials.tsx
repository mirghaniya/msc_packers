import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { Pencil, Trash2, Plus, MessageSquareQuote, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TestimonialFormData {
  customer_name: string;
  content: string;
  rating: number;
}

const initialFormData: TestimonialFormData = {
  customer_name: "",
  content: "",
  rating: 5,
};

const StarRow = ({
  rating,
  size = "h-5 w-5",
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: string;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => {
      const filled = i <= rating;
      const StarEl = (
        <Star
          className={`${size} ${filled ? "fill-secondary text-secondary" : "text-muted-foreground"}`}
        />
      );
      return interactive ? (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          aria-label={`Set rating to ${i}`}
          className="hover:scale-110 transition-transform"
        >
          {StarEl}
        </button>
      ) : (
        <span key={i}>{StarEl}</span>
      );
    })}
  </div>
);

const PreviewCard = ({ data }: { data: TestimonialFormData }) => (
  <Card className="border-border shadow-elegant bg-accent">
    <CardContent className="p-6 md:p-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <StarRow rating={data.rating} size="h-5 w-5" />
        </div>
        <p className="font-inter text-base md:text-lg text-foreground mb-4 italic min-h-[3rem]">
          "{data.content || "Your testimonial content will appear here..."}"
        </p>
        <p className="font-playfair font-semibold text-lg text-primary">
          {data.customer_name || "Customer name"}
        </p>
      </div>
    </CardContent>
  </Card>
);

const AdminTestimonials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(initialFormData);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      const { error } = await supabase.from("testimonials").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Testimonial added" });
      resetForm();
      setDialogOpen(false);
    },
    onError: (e) =>
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TestimonialFormData }) => {
      const { error } = await supabase.from("testimonials").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Testimonial updated" });
      resetForm();
      setDialogOpen(false);
    },
    onError: (e) =>
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Testimonial deleted" });
    },
    onError: (e) =>
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditing(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.customer_name.trim();
    const content = formData.content.trim();
    if (!name || !content) {
      toast({ title: "Error", description: "Name and message are required", variant: "destructive" });
      return;
    }
    if (name.length > 100) {
      toast({ title: "Error", description: "Name must be 100 characters or fewer", variant: "destructive" });
      return;
    }
    if (content.length > 500) {
      toast({ title: "Error", description: "Message must be 500 characters or fewer", variant: "destructive" });
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      toast({ title: "Error", description: "Rating must be 1-5", variant: "destructive" });
      return;
    }
    const payload = { customer_name: name, content, rating: formData.rating };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  const handleEdit = (t: any) => {
    setEditing(t);
    setFormData({ customer_name: t.customer_name, content: t.content, rating: t.rating });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-playfair text-2xl md:text-4xl font-bold">Testimonials</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage customer testimonials shown on the homepage
            </p>
          </div>
          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl">
                {editing ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="t-name">Customer Name</Label>
                <Input
                  id="t-name"
                  value={formData.customer_name}
                  maxLength={100}
                  onChange={(e) => setFormData((p) => ({ ...p, customer_name: e.target.value }))}
                  placeholder="e.g. Bhandari Traders"
                  required
                />
              </div>

              <div>
                <Label htmlFor="t-content">Message</Label>
                <Textarea
                  id="t-content"
                  value={formData.content}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                  placeholder="What did the customer say?"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.content.length}/500
                </p>
              </div>

              <div>
                <Label>Star Rating</Label>
                <div className="mt-2 flex items-center gap-3">
                  <StarRow
                    rating={formData.rating}
                    size="h-7 w-7"
                    interactive
                    onChange={(v) => setFormData((p) => ({ ...p, rating: v }))}
                  />
                  <span className="text-sm text-muted-foreground">{formData.rating} / 5</span>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Live Preview
                </Label>
                <div className="mt-2">
                  <PreviewCard data={formData} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <p className="text-muted-foreground">Loading testimonials...</p>
        ) : testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold">{t.customer_name}</h3>
                      <StarRow rating={t.rating} size="h-4 w-4" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this testimonial?")) deleteMutation.mutate(t.id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{t.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquareQuote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No testimonials yet</p>
              <Button onClick={handleAddNew} className="mt-4">
                Add Your First Testimonial
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
