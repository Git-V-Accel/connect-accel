import { useState } from 'react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Calendar } from '../../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Calendar as CalendarIcon, Clock, Video, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { toast } from '../../utils/toast';

const statusColors = {
  requested: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ClientConsultations() {
  const { user } = useAuth();
  const { getConsultationsByUser, createConsultation, updateConsultation } = useData();
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  if (!user) return null;

  const consultations = getConsultationsByUser(user.id, user.role);

  const handleBookConsultation = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    const scheduledDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    createConsultation({
      client_id: user.id,
      client_name: user.name,
      scheduled_date: scheduledDateTime.toISOString(),
      duration_minutes: parseInt(duration),
      status: 'requested',
      notes: notes || undefined,
      fee: 3000,
      paid: false,
    });

    toast.success('Consultation requested! We\'ll confirm and send you a meeting link shortly.');
    setShowBookDialog(false);
    setSelectedDate(new Date());
    setSelectedTime('');
    setNotes('');
  };

  const upcomingConsultations = consultations.filter(c => 
    c.status === 'scheduled' && new Date(c.scheduled_date) > new Date()
  );
  
  const pastConsultations = consultations.filter(c => 
    c.status === 'completed' || (c.status === 'scheduled' && new Date(c.scheduled_date) < new Date())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl">Consultations</h1>
            <p className="text-gray-600">Book free consultation calls with our expert advisors</p>
          </div>
          <Button size="lg" onClick={() => setShowBookDialog(true)}>
            <Plus className="size-5 mr-2" />
            Book Consultation
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-medium mb-2">Why book a consultation?</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Get expert advice on your project requirements</li>
            <li>• Receive accurate cost and timeline estimates</li>
            <li>• Understand technical feasibility and best approaches</li>
            <li>• Free 45-60 minute session with our technical advisors</li>
          </ul>
        </Card>

        {/* Upcoming Consultations */}
        {upcomingConsultations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Upcoming Consultations</h2>
            {upcomingConsultations.map(consultation => (
              <Card key={consultation.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4 flex-1">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Video className="size-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">Technical Consultation</h3>
                          {consultation.admin_name && (
                            <p className="text-sm text-gray-600">with {consultation.admin_name}</p>
                          )}
                        </div>
                        <Badge className={statusColors[consultation.status]}>
                          {consultation.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="size-4 text-gray-400" />
                          <span>{new Date(consultation.scheduled_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="size-4 text-gray-400" />
                          <span>
                            {new Date(consultation.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' '}({consultation.duration_minutes} mins)
                          </span>
                        </div>
                      </div>

                      {consultation.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{consultation.notes}</p>
                        </div>
                      )}

                      {consultation.meeting_link && (
                        <div className="mt-4">
                          <Button asChild>
                            <a href={consultation.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Video className="size-4 mr-2" />
                              Join Meeting
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Past Consultations */}
        {pastConsultations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Past Consultations</h2>
            {pastConsultations.map(consultation => (
              <Card key={consultation.id} className="p-6 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Video className="size-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">Technical Consultation</h3>
                          {consultation.admin_name && (
                            <p className="text-sm text-gray-600">with {consultation.admin_name}</p>
                          )}
                        </div>
                        <Badge className={statusColors[consultation.status]}>
                          {consultation.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{new Date(consultation.scheduled_date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{consultation.duration_minutes} minutes</span>
                      </div>

                      {consultation.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{consultation.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {consultations.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">No consultations yet</h3>
              <p className="text-gray-600 mb-6">
                Book your first free consultation to discuss your project with our experts
              </p>
              <Button onClick={() => setShowBookDialog(true)}>
                <Plus className="size-4 mr-2" />
                Book Consultation
              </Button>
            </div>
          </Card>
        )}

        {/* Book Consultation Dialog */}
        <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book a Consultation</DialogTitle>
              <DialogDescription>
                Schedule a free consultation call with our technical advisor
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="time">Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">What would you like to discuss?</Label>
                  <Textarea
                    id="notes"
                    placeholder="Brief description of your project or questions..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This is a free consultation. After the call, if you proceed with a project,
                the consultation will help us provide you with the most accurate estimate.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBookDialog(false)}>Cancel</Button>
              <Button onClick={handleBookConsultation} disabled={!selectedDate || !selectedTime}>
                <CheckCircle2 className="size-4 mr-2" />
                Book Consultation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
