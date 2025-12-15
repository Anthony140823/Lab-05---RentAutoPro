import { supabase } from '../lib/supabase';

export const rentalService = {
    async getAll() {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
        *,
        vehicle:vehicles(*),
        customer:profiles(*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
        *,
        vehicle:vehicles(*),
        customer:profiles(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(rental: any) {
        const { data, error } = await supabase
            .from('rentals')
            .insert(rental)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, rental: any) {
        const { data, error } = await supabase
            .from('rentals')
            .update(rental)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('rentals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async confirm(id: string) {
        const { data, error } = await supabase
            .from('rentals')
            .update({ status: 'confirmed' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async complete(id: string, endMileage: number) {
        const { data, error } = await supabase
            .from('rentals')
            .update({
                status: 'completed',
                end_mileage: endMileage,
                actual_return_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getByCustomer(customerId: string) {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
        *,
        vehicle:vehicles(*)
      `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getByVehicle(vehicleId: string) {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
        *,
        customer:profiles(*)
      `)
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    generatePDF(rentalId: string) {
        // This would call the Laravel backend endpoint
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        window.open(`${apiUrl}/rentals/${rentalId}/pdf`, '_blank');
    }
};
