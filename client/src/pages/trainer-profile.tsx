import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { 
  Star, MapPin, Award, Clock, DollarSign, Calendar, 
  MessageCircle, User, ArrowLeft, CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { TrainerWithServices, TrainerReviewWithUser, BookingWithDetails } from "@shared/schema";

// Stripe Buy Button Script Loader for Trainers
const loadStripeScript = () => {
  if (document.getElementById('stripe-trainer-script')) {
    return; // Script already loaded
  }
  
  const script = document.createElement('script');
  script.id = 'stripe-trainer-script';
  script.async = true;
  script.src = 'https://js.stripe.com/v3/buy-button.js';
  document.head.appendChild(script);
};

// Stripe Buy Button Component for Trainer Payments
const TrainerPaymentButton = ({ servicePrice }: { servicePrice: number }) => {
  useEffect(() => {
    loadStripeScript();
  }, []);

  return (
    <div className="trainer-payment-container mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
      <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 text-center">
        💳 Secure payment for trainer session (${servicePrice})
      </div>
      <stripe-buy-button
        buy-button-id="buy_btn_1S0D80D5Ue5ytgHWLCHlU78G"
        publishable-key="pk_live_51RydqBD5Ue5ytgHWpjOJg39P8VJu0EJMTBHZfdtZCSfRkf7EelPmERe5jat5DVUiIhfE1yDnyGVeBs9arKDQn8nZ00sMOvjEja"
      >
      </stripe-buy-button>
    </div>
  );
};

export default function TrainerProfile() {
  const [, params] = useRoute("/trainers/:id");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const trainerId = params?.id;

  const { data: trainer, isLoading: trainerLoading } = useQuery<TrainerWithServices>({
    queryKey: ["/api/trainers", trainerId],
    enabled: !!trainerId,
  });

  const { data: reviews } = useQuery<TrainerReviewWithUser[]>({
    queryKey: ["/api/trainers", trainerId, "reviews"],
    enabled: !!trainerId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowBookingDialog(false);
      setSelectedService("");
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
    },
  });

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !trainer) return;

    const service = trainer.services.find(s => s.id === selectedService);
    if (!service) return;

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);

    bookingMutation.mutate({
      trainerId: trainer.id,
      serviceId: selectedService,
      scheduledAt: scheduledAt.toISOString(),
      totalPrice: service.price,
      notes: notes || undefined,
    });
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatRating = (rating: number | null) => rating ? (rating / 100).toFixed(1) : "New";

  if (trainerLoading || !trainer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2" size={16} />
          Back to Trainers
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <User className="text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{trainer.user.name}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                          {trainer.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="text-yellow-400 fill-current" size={16} />
                              <span className="font-medium">{formatRating(trainer.rating)}</span>
                              <span className="text-gray-500">({trainer.totalReviews} reviews)</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Award size={16} />
                            <span>{trainer.experience} years experience</span>
                          </div>
                        </div>
                        {trainer.location && (
                          <div className="flex items-center space-x-1 text-gray-600 mt-1">
                            <MapPin size={16} />
                            <span>{trainer.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{formatPrice(trainer.hourlyRate)}</p>
                        <p className="text-sm text-gray-500">per hour</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{trainer.bio}</p>
              </CardContent>
            </Card>

            {/* Specialties & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specialties.map((specialty) => (
                      <Badge key={specialty} className="bg-primary/10 text-primary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {trainer.certifications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {trainer.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{review.user.name}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Services & Booking */}
          <div className="space-y-6">
            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainer.services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <span className="font-bold text-primary">{formatPrice(service.price)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{service.duration} minutes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Book Session */}
            <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Calendar className="mr-2" size={16} />
                  Book a Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Book a Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Service</label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainer.services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.price)} ({service.duration}min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const hour = 9 + i;
                            const time = `${hour.toString().padStart(2, '0')}:00`;
                            return (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                    <Textarea
                      placeholder="Any special requests or goals for the session..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleBooking} 
                    className="w-full"
                    disabled={!selectedService || !selectedDate || !selectedTime || bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
                  </Button>
                  
                  {selectedService && trainer?.services && (
                    <TrainerPaymentButton 
                      servicePrice={trainer.services.find(s => s.id === selectedService)?.price || 0}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Contact */}
            <Card>
              <CardContent className="pt-6">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2" size={16} />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}