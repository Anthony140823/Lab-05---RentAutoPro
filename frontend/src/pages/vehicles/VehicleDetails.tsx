import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  WrenchIcon,
  TruckIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Vehicle = Database['public']['Tables']['vehicles']['Row'] & {
  vehicle_types?: Database['public']['Tables']['vehicle_types']['Row'];
};

type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row'] & {
  maintenance_types?: Database['public']['Tables']['maintenance_types']['Row'];
};

type Rental = Database['public']['Tables']['rentals']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'maintenance' | 'rentals'>('details');

  useEffect(() => {
    if (id) {
      fetchVehicleDetails();
      fetchMaintenanceRecords();
      fetchRecentRentals();
    }
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_types (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setVehicle(data);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      navigate('/vehicles');
    }
  };

  const fetchMaintenanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          maintenance_types (
            id,
            name
          )
        `)
        .eq('vehicle_id', id)
        .order('performed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    }
  };

  const fetchRecentRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('vehicle_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentRentals(data || []);
    } catch (error) {
      console.error('Error fetching recent rentals:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!vehicle || !window.confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: newStatus as any })
        .eq('id', vehicle.id);

      if (error) throw error;
      fetchVehicleDetails();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      alert('Error al actualizar el estado del vehículo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'rented':
        return 'Alquilado';
      case 'maintenance':
        return 'En Mantenimiento';
      case 'unavailable':
        return 'No Disponible';
      default:
        return status;
    }
  };

  const canManageVehicles = profile?.role === 'admin' || profile?.role === 'fleet_manager';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-medium text-gray-900">Vehículo no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">El vehículo que buscas no existe o ha sido eliminado</p>
        <div className="mt-6">
          <Link
            to="/vehicles"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver a Vehículos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            to="/vehicles"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vehicle.license_plate}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </p>
          </div>
        </div>
        {canManageVehicles && (
          <div className="flex items-center space-x-3">
            <Link
              to={`/vehicles/${vehicle.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
          {getStatusLabel(vehicle.status)}
        </span>
        {canManageVehicles && vehicle.status !== 'rented' && (
          <div className="flex items-center space-x-2">
            {vehicle.status !== 'available' && (
              <button
                onClick={() => handleStatusChange('available')}
                className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Marcar como Disponible
              </button>
            )}
            {vehicle.status !== 'maintenance' && (
              <button
                onClick={() => handleStatusChange('maintenance')}
                className="inline-flex items-center px-3 py-1 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <WrenchIcon className="h-4 w-4 mr-1" />
                Enviar a Mantenimiento
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'details', label: 'Detalles', icon: TruckIcon },
            { key: 'maintenance', label: 'Mantenimiento', icon: WrenchIcon },
            { key: 'rentals', label: 'Alquileres', icon: CalendarIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información del Vehículo
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detalles completos del vehículo
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Placa</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {vehicle.license_plate}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Marca y Modelo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tipo de Vehículo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {vehicle.vehicle_types?.name || 'No especificado'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Color</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {vehicle.color || 'No especificado'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Kilometraje Actual</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {vehicle.current_mileage.toLocaleString()} km
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tipo de Combustible</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {vehicle.fuel_type || 'No especificado'}
                </dd>
              </div>
              {vehicle.fuel_efficiency && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Eficiencia de Combustible</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {vehicle.fuel_efficiency} km/l
                  </dd>
                </div>
              )}
              {vehicle.last_maintenance_date && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Último Mantenimiento</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(vehicle.last_maintenance_date), 'dd/MM/yyyy', { locale: es })}
                  </dd>
                </div>
              )}
              {vehicle.next_maintenance_mileage && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Próximo Mantenimiento (Kilometraje)</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {vehicle.next_maintenance_mileage.toLocaleString()} km
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Historial de Mantenimiento
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Registro de todos los mantenimientos realizados
            </p>
          </div>
          <div className="border-t border-gray-200">
            {maintenanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <WrenchIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay registros de mantenimiento
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Este vehículo no tiene mantenimientos registrados
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {maintenanceRecords.map((record) => (
                  <li key={record.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {record.maintenance_types?.name || 'Mantenimiento General'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {record.description || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Kilometraje: {record.mileage.toLocaleString()} km
                          </span>
                          <span>
                            Costo: ${record.cost?.toFixed(2) || '0.00'}
                          </span>
                          <span>
                            Realizado: {format(new Date(record.performed_at), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rentals' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Historial de Alquileres
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Registro de todos los alquileres de este vehículo
            </p>
          </div>
          <div className="border-t border-gray-200">
            {recentRentals.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay alquileres registrados
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Este vehículo no ha sido alquilado todavía
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentRentals.map((rental) => (
                  <li key={rental.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Cliente: {rental.profiles?.first_name} {rental.profiles?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(rental.start_date), 'dd/MM/yyyy', { locale: es })} - {' '}
                              {format(new Date(rental.end_date), 'dd/MM/yyyy', { locale: es })}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rental.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : rental.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : rental.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rental.status === 'completed' 
                              ? 'Completado'
                              : rental.status === 'in_progress'
                              ? 'En Progreso'
                              : rental.status === 'cancelled'
                              ? 'Cancelado'
                              : 'Pendiente'
                            }
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Monto Total: ${rental.total_amount.toFixed(2)}
                          </span>
                          <span>
                            Tarifa Diaria: ${rental.daily_rate.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
