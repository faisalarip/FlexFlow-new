import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, User, Star, DollarSign, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BookingWithDetails } from "@shared/schema";

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatRating = (rating: number | null) => rating ? (rating / 100).toFixed(1) : "New";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isUpcoming = (scheduledAt: Date | string) => {
    const date = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt;
    return date > new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings?.filter(b => 
    isUpcoming(b.scheduledAt) && b.status !== "cancelled"
  ) || [];
  
  const pastBookings = bookings?.filter(b => 
    !isUpcoming(b.scheduledAt) || b.status === "completed" || b.status === "cancelled"
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h1>
          <p className="text-gray-600">Manage your trainer sessions</p>
        </div>

        {/* Quick Stats */}
        {bookings && bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{upcomingBookings.length}</p>
                  <p className="text-sm text-gray-600">Upcoming Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.status === "completed").length}
                  </p>
                  <p className="text-sm text-gray-600">Completed Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">
                    {formatPrice(bookings.reduce((sum, b) => sum + b.totalPrice, 0))}
                  </p>
                  <p className="text-sm text-gray-600">Total Invested</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <User className="text-white" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{booking.service.name}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">with {booking.trainer.userId}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} className="text-gray-400" />
                                <span>{format(new Date(booking.scheduledAt), "MMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock size={16} className="text-gray-400" />
                                <span>
                                  {format(new Date(booking.scheduledAt), "h:mm a")} 
                                  ({booking.service.duration} min)
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign size={16} className="text-gray-400" />
                                <span className="font-medium">{formatPrice(booking.totalPrice)}</span>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">{booking.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" variant="outline">
                          <MessageCircle size={14} className="mr-1" />
                          Message
                        </Button>
                        {booking.status === "pending" && (
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Sessions</h2>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="opacity-75">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                            <User className="text-white" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{booking.service.name}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">with {booking.trainer.userId}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} className="text-gray-400" />
                                <span>{format(new Date(booking.scheduledAt), "MMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock size={16} className="text-gray-400" />
                                <span>
                                  {format(new Date(booking.scheduledAt), "h:mm a")} 
                                  ({booking.service.duration} min)
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign size={16} className="text-gray-400" />
                                <span className="font-medium">{formatPrice(booking.totalPrice)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {booking.status === "completed" && (
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" variant="outline">
                            Write Review
                          </Button>
                          <Button size="sm" variant="outline">
                            Book Again
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!bookings || bookings.length === 0) && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Find a trainer and book your first session</p>
            <Button>
              Browse Trainers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}