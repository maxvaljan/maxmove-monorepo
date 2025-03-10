'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import VehicleCarousel from './vehicle/VehicleCarousel';

interface VehicleType {
  id: string;
  name: string;
  category: string;
  description: string;
  dimensions: string;
  max_weight: string;
}

interface VehicleSelectionProps {
  onVehicleSelect: (vehicleId: string | null) => void;
}

export default function VehicleSelection({ onVehicleSelect }: VehicleSelectionProps) {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicleTypes() {
      try {
        // First try to fetch from API
        const response = await fetch('http://localhost:3000/api/vehicle-types');
        
        if (response.ok) {
          const data = await response.json();
          setVehicleTypes(data.data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn('API fetch failed, falling back to Supabase');
      }

      // Fallback to direct Supabase query
      try {
        const { data, error } = await supabase
          .from('vehicle_types')
          .select('*');

        if (error) throw error;
        setVehicleTypes(data || []);
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicleTypes();
  }, []);

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    onVehicleSelect(vehicleId);
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-md bg-slate-50">
        <div className="h-20 animate-pulse bg-slate-200 rounded-md"></div>
      </div>
    );
  }

  // Create vehicle type groupings
  const standardVehicles = vehicleTypes.filter(v => 
    ['car', 'bike_motorcycle'].includes(v.category)
  );
  
  const specialVehicles = vehicleTypes.filter(v => 
    ['van', 'light_truck', 'medium_truck'].includes(v.category)
  );
  
  const heavyVehicles = vehicleTypes.filter(v => 
    ['heavy_truck', 'refrigerated', 'towing'].includes(v.category)
  );

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Select Vehicle Type</Label>
      
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
          <TabsTrigger value="heavy">Heavy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard">
          <VehicleCarousel 
            vehicles={standardVehicles}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
          />
        </TabsContent>
        
        <TabsContent value="special">
          <VehicleCarousel 
            vehicles={specialVehicles}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
          />
        </TabsContent>
        
        <TabsContent value="heavy">
          <VehicleCarousel 
            vehicles={heavyVehicles}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={handleVehicleSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}