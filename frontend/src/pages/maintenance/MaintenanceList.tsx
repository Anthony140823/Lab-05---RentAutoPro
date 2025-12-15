import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  WrenchIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row'] & {
  vehicles?: Database['public']['Tables']['vehicles']['Row'];
  maintenance_types?: Database['public']['Tables']['maintenance_types']['Row'];
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

type MaintenanceType = Database['public']['Tables']['maintenance_types']['Row'];

export default function MaintenanceList() {
  const { profile } = useAuth();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchMaintenanceTypes();
  }, []);

  const fetchMaintenanceRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          vehicles (
            id,
            license_plate,
            make,
            model
          ),
          maintenance_types (
            id,
            name
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setMaintenanceTypes(data || []);
    } catch (error) {
      console.error('Error fetching maintenance types:', error);
    }
  };

  const getMaintenanceStatus = (record: MaintenanceRecord) => {
    const today = new Date();
    const dueDate = record.next_due_date ? new Date(record.next_due_date) : null;
    
    if (record.performed_at) {
      return { status: 'completed', label: 'Completado', color: 'bg-green-100 text-green-800' };
    } else if (dueDate) {
      if (dueDate < today) {
        return { status: 'overdue', label: 'Vencido', color: 'bg-red-100 text-red-800' };
      } else if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
        return { status: 'upcoming', label: 'Próximo', color: 'bg-yellow-100 text-yellow-800' };
      } else {
        return { status: 'scheduled', label: 'Programado', color: 'bg-blue-100 text-blue-800' };
      }
    }
    return { status: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.vehicles?.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vehicles?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vehicles?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const recordStatus = getMaintenanceStatus(record);
    const matchesStatus = statusFilter === 'all' || recordStatus.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.maintenance_type_id === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const canManageMaintenance = profile?.role === 'admin' || profile?.role === 'fleet_manager' || profile?.role === 'mechanic';

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
          <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona el mantenimiento de la flota
          </p>
        </div>
        {canManageMaintenance && (
          <Link
            to="/maintenance/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Mantenimiento
          </Link>
        )}
      </div>

      {/* Alerts */}
      {(() => {
        const overdueCount = maintenanceRecords.filter(r => getMaintenanceStatus(r).status === 'overdue').length;
        const upcomingCount = maintenanceRecords.filter(r => getMaintenanceStatus(r).status === 'upcoming').length;
        
        return (overdueCount > 0 || upcomingCount > 0) && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Alertas de Mantenimiento</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    {overdueCount > 0 && (
                      <li>Tienes {overdueCount} mantenimientos vencidos</li>
                    )}
                    {upcomingCount > 0 && (
                      <li>Tienes {upcomingCount} mantenimientos próximos (7 días)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Buscar por vehículo, descripción..."
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
            <option value="scheduled">Programado</option>
            <option value="upcoming">Próximo</option>
            <option value="overdue">Vencido</option>
            <option value="completed">Completado</option>
          </select>

          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            {maintenanceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <WrenchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No se encontraron mantenimientos
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando un nuevo mantenimiento'
              }
            </p>
            {canManageMaintenance && !searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <div className="mt-6">
                <Link
                  to="/maintenance/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Mantenimiento
                </Link>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredRecords.map((record) => {
              const statusInfo = getMaintenanceStatus(record);
              return (
                <li key={record.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {record.vehicles?.license_plate} - {record.maintenance_types?.name || 'Mantenimiento General'}
                            </p>
                            <p className="text-sm text-gray-900">
                              {record.vehicles?.make} {record.vehicles?.model}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Kilometraje: {record.mileage.toLocaleString()} km
                          </span>
                          <span>
                            Costo: ${record.cost?.toFixed(2) || '0.00'}
                          </span>
                          {record.performed_at && (
                            <span>
                              Realizado: {format(new Date(record.performed_at), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          )}
                          {record.next_due_date && !record.performed_at && (
                            <span>
                              Programado: {format(new Date(record.next_due_date), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          )}
                          {record.profiles && (
                            <span>
                              Realizado por: {record.profiles.first_name} {record.profiles.last_name}
                            </span>
                          )}
                        </div>
                        {record.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {record.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/maintenance/${record.id}`}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <WrenchIcon className="h-4 w-4" />
                        </Link>
                        {canManageMaintenance && statusInfo.status !== 'completed' && (
                          <button
                            onClick={() => {
                              // Mark as completed logic
                            }}
                            className="inline-flex items-center p-2 border border-green-300 rounded-md shadow-sm text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title="Marcar como completado"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
