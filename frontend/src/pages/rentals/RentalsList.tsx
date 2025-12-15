import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Rental = Database['public']['Tables']['rentals']['Row'] & {
  vehicles?: Database['public']['Tables']['vehicles']['Row'];
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

export default function RentalsList() {
  const { profile } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('rentals')
        .select(`
          *,
          vehicles (
            id,
            license_plate,
            make,
            model
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      // If user is customer, only show their rentals
      if (profile?.role === 'customer') {
        query = query.eq('customer_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRentals(data || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (rentalId: string, newStatus: string) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status: newStatus as any })
        .eq('id', rentalId);

      if (error) throw error;
      fetchRentals();
    } catch (error) {
      console.error('Error updating rental status:', error);
      alert('Error al actualizar el estado del alquiler');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.vehicles?.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.vehicles?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.vehicles?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const canManageRentals = profile?.role === 'admin' || profile?.role === 'fleet_manager';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alquileres</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona los alquileres de vehículos
          </p>
        </div>
        {canManageRentals && (
          <Link
            to="/rentals/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Alquiler
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Buscar por vehículo, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredRentals.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron alquileres
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando un nuevo alquiler'
              }
            </p>
            {canManageRentals && !searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <Link
                  to="/rentals/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Alquiler
                </Link>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredRentals.map((rental) => (
              <li key={rental.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm font-medium text-primary-600 truncate">
                            Alquiler #{rental.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-900">
                            {rental.vehicles?.make} {rental.vehicles?.model} ({rental.vehicles?.license_plate})
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                          {getStatusLabel(rental.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Cliente: {rental.profiles?.first_name} {rental.profiles?.last_name}
                        </span>
                        <span>
                          {format(new Date(rental.start_date), 'dd/MM/yyyy', { locale: es })} - {' '}
                          {format(new Date(rental.end_date), 'dd/MM/yyyy', { locale: es })}
                        </span>
                        <span>
                          Total: ${rental.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/rentals/${rental.id}`}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {canManageRentals && (
                        <>
                          {rental.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(rental.id, 'confirmed')}
                              className="inline-flex items-center p-2 border border-green-300 rounded-md shadow-sm text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              title="Confirmar alquiler"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          {rental.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(rental.id, 'in_progress')}
                              className="inline-flex items-center p-2 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="Iniciar alquiler"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </button>
                          )}
                          {rental.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(rental.id, 'completed')}
                              className="inline-flex items-center p-2 border border-purple-300 rounded-md shadow-sm text-xs font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              title="Completar alquiler"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          {(rental.status === 'pending' || rental.status === 'confirmed') && (
                            <button
                              onClick={() => handleUpdateStatus(rental.id, 'cancelled')}
                              className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              title="Cancelar alquiler"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
