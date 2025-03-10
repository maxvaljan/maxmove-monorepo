'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, startOfToday, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface Stop {
  address: string;
  type: 'pickup' | 'dropoff' | 'stop';
  coordinates?: [number, number];
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

interface BookingFormProps {
  stops: Stop[];
  setStops: (stops: Stop[]) => void;
  suggestions: Suggestion[];
  activeInput: number | null;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  onAddressChange: (value: string, index: number) => void;
  onSuggestionSelect: (suggestion: Suggestion, index: number) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
}

const BookingForm = ({
  stops,
  setStops,
  suggestions,
  activeInput,
  suggestionsRef,
  onAddressChange,
  onSuggestionSelect,
  onAddStop,
  onRemoveStop
}: BookingFormProps) => {
  const [date, setDate] = useState<Date>(startOfToday());
  
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 30) * 30;
  now.setMinutes(roundedMinutes === 60 ? 0 : roundedMinutes);
  now.setHours(roundedMinutes === 60 ? now.getHours() + 1 : now.getHours());
  now.setSeconds(0);
  now.setMilliseconds(0);
  
  const defaultTime = format(now, 'HH:mm');
  const [selectedTime, setSelectedTime] = useState<string>(defaultTime);

  const generateTimeSlots = () => {
    const slots = [];
    const currentDate = new Date();
    const currentMinute = currentDate.getMinutes();
    const roundedMinute = Math.ceil(currentMinute / 30) * 30;
    const adjustedHour = roundedMinute === 60 ? currentDate.getHours() + 1 : currentDate.getHours();
    const adjustedMinute = roundedMinute === 60 ? 0 : roundedMinute;

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (isToday(date)) {
          if (hour < adjustedHour || (hour === adjustedHour && minute < adjustedMinute)) {
            continue;
          }
        }
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate || isBefore(newDate, startOfToday())) {
      return;
    }
    setDate(newDate);
    
    if (isToday(newDate)) {
      const currentDate = new Date();
      const currentMinute = currentDate.getMinutes();
      const roundedMinute = Math.ceil(currentMinute / 30) * 30;
      const adjustedHour = roundedMinute === 60 ? currentDate.getHours() + 1 : currentDate.getHours();
      const adjustedMinute = roundedMinute === 60 ? 0 : roundedMinute;
      const currentTime = `${adjustedHour.toString().padStart(2, '0')}:${adjustedMinute.toString().padStart(2, '0')}`;
      
      if (selectedTime < currentTime) {
        setSelectedTime(currentTime);
      }
    }
  };

  const getDateDisplayText = () => {
    if (!date) return "Select date";
    return isToday(date) ? "Today" : format(date, "dd.MM.yyyy");
  };

  const getTimeDisplayText = () => {
    if (!selectedTime) return "Select time";
    
    const closestTime = getClosestAvailableTime();
    return selectedTime === closestTime && isToday(date) ? "Now" : selectedTime;
  };

  const getClosestAvailableTime = () => {
    const currentDate = new Date();
    const currentMinute = currentDate.getMinutes();
    const roundedMinute = Math.ceil(currentMinute / 30) * 30;
    const adjustedHour = roundedMinute === 60 ? currentDate.getHours() + 1 : currentDate.getHours();
    const adjustedMinute = roundedMinute === 60 ? 0 : roundedMinute;
    return `${adjustedHour.toString().padStart(2, '0')}:${adjustedMinute.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 bg-transparent">
      <div className="space-y-4">
        {stops.map((stop, index) => (
          <div key={index} className="relative">
            <div className="flex gap-2">
              <Input
                placeholder={stop.type === 'pickup' ? "Pickup location" : stop.type === 'dropoff' ? "Dropoff location" : "Stop location"}
                value={stop.address}
                onChange={(e) => onAddressChange(e.target.value, index)}
                className="pl-10 bg-white border-0 shadow-none focus-visible:ring-1"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              {index > 0 && index < stops.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveStop(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {activeInput === index && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-sm border-0"
              >
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSuggestionSelect(suggestion, index)}
                  >
                    {suggestion.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {stops.length < 5 && (
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 border-0 bg-white shadow-none hover:bg-gray-50"
            onClick={onAddStop}
          >
            <Plus className="h-4 w-4" />
            Add stop
          </Button>
        )}

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-0 bg-white shadow-none hover:bg-gray-50",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {getDateDisplayText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(date, startOfToday())}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-0 bg-white shadow-none hover:bg-gray-50",
                  !selectedTime && "text-muted-foreground"
                )}
              >
                <Clock className="mr-2 h-4 w-4" />
                {getTimeDisplayText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                {generateTimeSlots().map((time) => (
                  <div
                    key={time}
                    className={cn(
                      "px-4 py-2 hover:bg-gray-50 cursor-pointer",
                      selectedTime === time && "bg-gray-50"
                    )}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;