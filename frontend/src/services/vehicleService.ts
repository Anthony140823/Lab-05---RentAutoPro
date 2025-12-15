import { supabase } from '../lib/supabase';

export const vehicleService = {
    async getAll() {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, vehicle_type:vehicle_types(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, vehicle_type:vehicle_types(*), maintenance_records(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(vehicle: any) {
        const { data, error } = await supabase
            .from('vehicles')
            .insert(vehicle)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, vehicle: any) {
        const { data, error } = await supabase
            .from('vehicles')
            .update(vehicle)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getAvailable(startDate?: string, endDate?: string) {
        let query = supabase
            .from('vehicles')
            .select('*, vehicle_type:vehicle_types(*)')
            .eq('status', 'available');

        const { data, error } = await query;

        if (error) throw error;
        return data;
    },

    async updateStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from('vehicles')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getVehicleTypes() {
        const { data, error } = await supabase
            .from('vehicle_types')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }
};
