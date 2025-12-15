import { supabase } from '../lib/supabase';

export const maintenanceService = {
    async getAll() {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select(`
        *,
        vehicle:vehicles(*),
        maintenance_type:maintenance_types(*),
        performed_by:profiles(*)
      `)
            .order('performed_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select(`
        *,
        vehicle:vehicles(*),
        maintenance_type:maintenance_types(*),
        performed_by:profiles(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(maintenance: any) {
        const { data, error } = await supabase
            .from('maintenance_records')
            .insert(maintenance)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, maintenance: any) {
        const { data, error } = await supabase
            .from('maintenance_records')
            .update(maintenance)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('maintenance_records')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getByVehicle(vehicleId: string) {
        const { data, error } = await supabase
            .from('maintenance_records')
            .select(`
        *,
        maintenance_type:maintenance_types(*),
        performed_by:profiles(*)
      `)
            .eq('vehicle_id', vehicleId)
            .order('performed_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getScheduled() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const { data, error } = await supabase
            .from('maintenance_records')
            .select(`
        *,
        vehicle:vehicles(*),
        maintenance_type:maintenance_types(*)
      `)
            .gte('next_due_date', new Date().toISOString())
            .lte('next_due_date', thirtyDaysFromNow.toISOString())
            .order('next_due_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getMaintenanceTypes() {
        const { data, error } = await supabase
            .from('maintenance_types')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }
};
