import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bkzbtlrgpeadneyawihy.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJremJ0bHJncGVhZG5leWF3aWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDgxMTgsImV4cCI6MjA4MTMyNDExOH0.Gq9spU9PmxTordKpnPO2ItoSB3_omDWrpiCFd011Kbg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: 'admin' | 'fleet_manager' | 'customer' | 'mechanic' | 'accounting';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'fleet_manager' | 'customer' | 'mechanic' | 'accounting';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'fleet_manager' | 'customer' | 'mechanic' | 'accounting';
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicle_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          license_plate: string;
          make: string;
          model: string;
          year: number;
          vehicle_type_id: string | null;
          color: string | null;
          status: 'available' | 'rented' | 'maintenance' | 'unavailable';
          current_mileage: number;
          fuel_type: string | null;
          fuel_efficiency: number | null;
          last_maintenance_date: string | null;
          next_maintenance_mileage: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          license_plate: string;
          make: string;
          model: string;
          year: number;
          vehicle_type_id?: string | null;
          color?: string | null;
          status?: 'available' | 'rented' | 'maintenance' | 'unavailable';
          current_mileage?: number;
          fuel_type?: string | null;
          fuel_efficiency?: number | null;
          last_maintenance_date?: string | null;
          next_maintenance_mileage?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          license_plate?: string;
          make?: string;
          model?: string;
          year?: number;
          vehicle_type_id?: string | null;
          color?: string | null;
          status?: 'available' | 'rented' | 'maintenance' | 'unavailable';
          current_mileage?: number;
          fuel_type?: string | null;
          fuel_efficiency?: number | null;
          last_maintenance_date?: string | null;
          next_maintenance_mileage?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      maintenance_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          recommended_interval_km: number | null;
          recommended_interval_months: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          recommended_interval_km?: number | null;
          recommended_interval_months?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          recommended_interval_km?: number | null;
          recommended_interval_months?: number | null;
        };
      };
      maintenance_records: {
        Row: {
          id: string;
          vehicle_id: string;
          maintenance_type_id: string | null;
          performed_by: string | null;
          description: string | null;
          cost: number | null;
          mileage: number;
          performed_at: string;
          next_due_mileage: number | null;
          next_due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          maintenance_type_id?: string | null;
          performed_by?: string | null;
          description?: string | null;
          cost?: number | null;
          mileage: number;
          performed_at?: string;
          next_due_mileage?: number | null;
          next_due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          maintenance_type_id?: string | null;
          performed_by?: string | null;
          description?: string | null;
          cost?: number | null;
          mileage?: number;
          performed_at?: string;
          next_due_mileage?: number | null;
          next_due_date?: string | null;
          created_at?: string;
        };
      };
      rentals: {
        Row: {
          id: string;
          vehicle_id: string | null;
          customer_id: string | null;
          start_date: string;
          end_date: string;
          actual_return_date: string | null;
          start_mileage: number | null;
          end_mileage: number | null;
          daily_rate: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id?: string | null;
          customer_id?: string | null;
          start_date: string;
          end_date: string;
          actual_return_date?: string | null;
          start_mileage?: number | null;
          end_mileage?: number | null;
          daily_rate: number;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string | null;
          customer_id?: string | null;
          start_date?: string;
          end_date?: string;
          actual_return_date?: string | null;
          start_mileage?: number | null;
          end_mileage?: number | null;
          daily_rate?: number;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          rental_id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          status: 'pending' | 'paid' | 'overdue' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          rental_id: string;
          invoice_number: string;
          issue_date?: string;
          due_date: string;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          rental_id?: string;
          invoice_number?: string;
          issue_date?: string;
          due_date?: string;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
          created_at?: string;
        };
      };
      fuel_records: {
        Row: {
          id: string;
          vehicle_id: string;
          rental_id: string | null;
          fuel_amount: number;
          fuel_cost: number;
          mileage: number;
          fuel_type: string;
          filled_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          rental_id?: string | null;
          fuel_amount: number;
          fuel_cost: number;
          mileage: number;
          fuel_type: string;
          filled_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          rental_id?: string | null;
          fuel_amount?: number;
          fuel_cost?: number;
          mileage?: number;
          fuel_type?: string;
          filled_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
