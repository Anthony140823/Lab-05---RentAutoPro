import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import {
  TruckIcon,
  CalendarIcon,
  WrenchIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Rental = Database['public']['Tables']['rentals']['Row'];
type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row'];

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  activeRentals: number;
  pendingRentals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  overdueMaintenance: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    availableVehicles: 0,
    rentedVehicles: 0,
    maintenanceVehicles: 0,
    activeRentals: 0,
    pendingRentals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingMaintenance: 0,
    overdueMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch vehicles stats
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('status');

      const vehicleStats = vehicles?.reduce((acc, vehicle) => {
        acc.totalVehicles++;
        switch (vehicle.status) {
          case 'available':
            acc.availableVehicles++;
            break;
          case 'rented':
            acc.rentedVehicles++;
            break;
          case 'maintenance':
            acc.maintenanceVehicles++;
            break;
        }
        return acc;
      }, {
        totalVehicles: 0,
        availableVehicles: 0,
        rentedVehicles: 0,
        maintenanceVehicles: 0,
      }) || {
        totalVehicles: 0,
        availableVehicles: 0,
        rentedVehicles: 0,
        maintenanceVehicles: 0,
      };

      // Fetch rentals stats
      const { data: rentals } = await supabase
        .from('rentals')
        .select('status, total_amount, created_at');

      const rentalStats = rentals?.reduce((acc, rental) => {
        switch (rental.status) {
          case 'confirmed':
          case 'in_progress':
            acc.activeRentals++;
            break;
          case 'pending':
            acc.pendingRentals++;
            break;
        }
        acc.totalRevenue += rental.total_amount;

        // Calculate monthly revenue
        const rentalDate = new Date(rental.created_at);
        const currentDate = new Date();
        if (rentalDate.getMonth() === currentDate.getMonth() &&
          rentalDate.getFullYear() === currentDate.getFullYear()) {
          acc.monthlyRevenue += rental.total_amount;
        }

        return acc;
      }, {
        activeRentals: 0,
        pendingRentals: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      }) || {
        activeRentals: 0,
        pendingRentals: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      };

      // Fetch maintenance records
      const { data: maintenanceRecords } = await supabase
        .from('maintenance_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const maintenanceStats = maintenanceRecords?.reduce((acc, record) => {
        const today = new Date();
        const dueDate = record.next_due_date ? new Date(record.next_due_date) : null;

        if (dueDate && dueDate < today) {
          acc.overdueMaintenance++;
        } else if (dueDate) {
          acc.pendingMaintenance++;
        }
        return acc;
      }, {
        pendingMaintenance: 0,
        overdueMaintenance: 0,
      }) || {
        pendingMaintenance: 0,
        overdueMaintenance: 0,
      };

      // Fetch recent rentals
      const { data: recentRentalsData } = await supabase
        .from('rentals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch upcoming maintenance
      const { data: upcomingMaintenanceData } = await supabase
        .from('maintenance_records')
        .select('*')
        .gte('next_due_date', new Date().toISOString())
        .order('next_due_date', { ascending: true })
        .limit(5);

      setStats({
        ...vehicleStats,
        ...rentalStats,
        ...maintenanceStats,
      });

      setRecentRentals(recentRentalsData || []);
      setUpcomingMaintenance(upcomingMaintenanceData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedStats = () => {
    // PUBLIC VIEW: Show all stats
    const baseStats = [
      {
        name: 'Vehículos Disponibles',
        value: stats.availableVehicles,
        total: stats.totalVehicles,
        icon: TruckIcon,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
      },
      {
        name: 'Alquileres Activos',
        value: stats.activeRentals,
        icon: CalendarIcon,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
      },
      {
        name: 'Ingresos Mensuales',
        value: stats.monthlyRevenue,
        icon: CurrencyDollarIcon,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
      },
      {
        name: 'Mantenimientos Pendientes',
        value: stats.pendingMaintenance + stats.overdueMaintenance,
        icon: WrenchIcon,
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
      }
    ];

    return baseStats;
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vista general de la flota
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {getRoleBasedStats().map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden rounded-lg shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.name === 'Ingresos Mensuales'
                          ? `$${stat.value.toFixed(2)}`
                          : stat.value
                        }
                      </div>
                      {stat.total && (
                        <div className="ml-2 text-sm text-gray-500">
                          de {stat.total}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.overdueMaintenance > 0 || stats.pendingRentals > 0) && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Alertas Importantes</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {stats.overdueMaintenance > 0 && (
                    <li>Tienes {stats.overdueMaintenance} mantenimientos vencidos</li>
                  )}
                  {stats.pendingRentals > 0 && (
                    <li>Tienes {stats.pendingRentals} alquileres pendientes de confirmación</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rentals */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Alquileres Recientes
            </h3>
            <div className="mt-5 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentRentals.length === 0 ? (
                  <li className="py-4">
                    <div className="text-center text-gray-500">
                      No hay alquileres recientes
                    </div>
                  </li>
                ) : (
                  recentRentals.map((rental) => (
                    <li key={rental.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Alquiler #{rental.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(rental.start_date), 'dd/MM/yyyy', { locale: es })} -{' '}
                            {format(new Date(rental.end_date), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rental.status === 'completed'
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
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Próximos Mantenimientos
            </h3>
            <div className="mt-5 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {upcomingMaintenance.length === 0 ? (
                  <li className="py-4">
                    <div className="text-center text-gray-500">
                      No hay mantenimientos programados
                    </div>
                  </li>
                ) : (
                  upcomingMaintenance.map((maintenance) => (
                    <li key={maintenance.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <WrenchIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {maintenance.description || 'Mantenimiento Programado'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {maintenance.next_due_date
                              ? format(new Date(maintenance.next_due_date), 'dd/MM/yyyy', { locale: es })
                              : 'Sin fecha definida'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Programado
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
