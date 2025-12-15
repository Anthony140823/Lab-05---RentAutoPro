import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  WrenchIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [revenueData, setRevenueData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [fleetData, setFleetData] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRevenueReport(),
        fetchMaintenanceReport(),
        fetchFleetReport()
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueReport = async () => {
    const { data: rentals, error } = await supabase
      .from('rentals')
      .select('*, vehicle:vehicles(*)')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .in('status', ['completed', 'confirmed']);

    if (!error && rentals) {
      const totalRevenue = rentals.reduce((sum, r) => sum + r.total_amount, 0);
      const avgRental = rentals.length > 0 ? totalRevenue / rentals.length : 0;

      setRevenueData({
        total: totalRevenue,
        count: rentals.length,
        average: avgRental,
        rentals
      });
    }
  };

  const fetchMaintenanceReport = async () => {
    const { data: maintenances, error } = await supabase
      .from('maintenance_records')
      .select('*, vehicle:vehicles(*), maintenance_type:maintenance_types(*)')
      .gte('performed_at', dateRange.start)
      .lte('performed_at', dateRange.end);

    if (!error && maintenances) {
      const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
      const avgCost = maintenances.length > 0 ? totalCost / maintenances.length : 0;

      setMaintenanceData({
        total: totalCost,
        count: maintenances.length,
        average: avgCost,
        maintenances
      });
    }
  };

  const fetchFleetReport = async () => {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*, vehicle_type:vehicle_types(*)');

    if (!error && vehicles) {
      const statusCounts = vehicles.reduce((acc: any, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(statusCounts).map(([status, count]) => ({
        name: getStatusLabel(status),
        value: count as number,
        color: getStatusChartColor(status)
      }));

      setFleetData({
        total: vehicles.length,
        statusCounts,
        chartData,
        vehicles
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      available: 'Disponible',
      rented: 'Alquilado',
      maintenance: 'Mantenimiento',
      unavailable: 'No Disponible'
    };
    return labels[status] || status;
  };

  const getStatusChartColor = (status: string) => {
    const colors: any = {
      available: '#10B981',
      rented: '#3B82F6',
      maintenance: '#F59E0B',
      unavailable: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const canViewReports = profile?.role === 'admin' || profile?.role === 'accounting' || profile?.role === 'fleet_manager';

  if (!canViewReports) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Acceso Restringido
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No tienes permisos para ver los reportes
        </p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-1 text-sm text-gray-600">
          Análisis y estadísticas del negocio
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Totales
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${revenueData?.total.toFixed(2) || '0.00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-600">{revenueData?.count || 0} alquileres</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <WrenchIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Costos de Mantenimiento
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${maintenanceData?.total.toFixed(2) || '0.00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-600">{maintenanceData?.count || 0} mantenimientos</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Flota Total
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {fleetData?.total || 0} vehículos
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-600">
                {fleetData?.statusCounts?.available || 0} disponibles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Estado de la Flota
          </h3>
          {fleetData?.chartData && fleetData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fleetData.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fleetData.chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No hay datos disponibles
            </div>
          )}
        </div>

        {/* Revenue vs Maintenance */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ingresos vs Costos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: 'Período Actual',
                  Ingresos: revenueData?.total || 0,
                  Costos: maintenanceData?.total || 0,
                }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Ingresos" fill="#10B981" />
              <Bar dataKey="Costos" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
