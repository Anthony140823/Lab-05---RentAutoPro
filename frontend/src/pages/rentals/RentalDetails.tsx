import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Rental = Database['public']['Tables']['rentals']['Row'] & {
  vehicles?: Database['public']['Tables']['vehicles']['Row'];
  profiles?: Database['public']['Tables']['profiles']['Row'];
  invoices?: Database['public']['Tables']['invoices']['Row'];
};

export default function RentalDetails() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRentalDetails();
    }
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          vehicles (
            id,
            license_plate,
            make,
            model,
            year,
            color
          ),
          profiles (
            first_name,
            last_name,
            phone,
            email
          ),
          invoices (
            id,
            invoice_number,
            issue_date,
            due_date,
            subtotal,
            tax_amount,
            total_amount,
            status
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setRental(data);
    } catch (error) {
      console.error('Error fetching rental details:', error);
      navigate('/rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!rental || !window.confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status: newStatus as any })
        .eq('id', rental.id);

      if (error) throw error;
      fetchRentalDetails();
    } catch (error) {
      console.error('Error updating rental status:', error);
      alert('Error al actualizar el estado del alquiler');
    }
  };

  const generateInvoice = async () => {
    if (!rental) return;

    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const issueDate = new Date().toISOString();
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
      const taxAmount = rental.total_amount * 0.16; // 16% tax
      const subtotal = rental.total_amount - taxAmount;

      const { error } = await supabase
        .from('invoices')
        .insert({
          rental_id: rental.id,
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          due_date: dueDate,
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_amount: rental.total_amount,
          status: 'pending',
        });

      if (error) throw error;
      fetchRentalDetails();
      alert('Factura generada exitosamente');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error al generar la factura');
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

  const canManageRentals = profile?.role === 'admin' || profile?.role === 'fleet_manager';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-medium text-gray-900">Alquiler no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">El alquiler que buscas no existe o ha sido eliminado</p>
        <div className="mt-6">
          <Link
            to="/rentals"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver a Alquileres
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
            to="/rentals"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Alquiler #{rental.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {rental.vehicles?.make} {rental.vehicles?.model} ({rental.vehicles?.license_plate})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rental.status)}`}>
            {getStatusLabel(rental.status)}
          </span>
          {canManageRentals && (
            <div className="flex items-center space-x-2">
              {rental.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Confirmar
                </button>
              )}
              {rental.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Iniciar
                </button>
              )}
              {rental.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="inline-flex items-center px-3 py-1 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Completar
                </button>
              )}
              {(rental.status === 'pending' || rental.status === 'confirmed') && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rental Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <TruckIcon className="h-5 w-5 mr-2" />
                Información del Vehículo
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Vehículo</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {rental.vehicles?.make} {rental.vehicles?.model} ({rental.vehicles?.year})
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Placa</dt>
                  <dd className="mt-1 text-sm text-gray-900">{rental.vehicles?.license_plate}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Color</dt>
                  <dd className="mt-1 text-sm text-gray-900">{rental.vehicles?.color || 'No especificado'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Kilometraje Inicial</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {rental.start_mileage?.toLocaleString() || '0'} km
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Información del Cliente
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {rental.profiles?.first_name} {rental.profiles?.last_name}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd className="mt-1 text-sm text-gray-900">{rental.profiles?.phone || 'No especificado'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd className="mt-1 text-sm text-gray-900">{rental.profiles?.phone || 'No especificado'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Período de Alquiler
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(rental.start_date), 'dd/MM/yyyy', { locale: es })}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Fin</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(rental.end_date), 'dd/MM/yyyy', { locale: es })}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Devolución Real</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {rental.actual_return_date
                      ? format(new Date(rental.actual_return_date), 'dd/MM/yyyy', { locale: es })
                      : 'Pendiente'
                    }
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Kilometraje Final</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {rental.end_mileage?.toLocaleString() || 'Pendiente'} km
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Información Financiera
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tarifa Diaria</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ${rental.daily_rate.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Monto Total</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ${rental.total_amount.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Factura
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {rental.invoices ? (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Número de Factura</dt>
                    <dd className="mt-1 text-sm text-gray-900">{rental.invoices.invoice_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rental.invoices.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : rental.invoices.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {rental.invoices.status === 'paid'
                          ? 'Pagada'
                          : rental.invoices.status === 'overdue'
                            ? 'Vencida'
                            : 'Pendiente'
                        }
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de Emisión</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(new Date(rental.invoices.issue_date), 'dd/MM/yyyy', { locale: es })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de Vencimiento</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(new Date(rental.invoices.due_date), 'dd/MM/yyyy', { locale: es })}
                    </dd>
                  </div>
                </dl>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No hay factura generada</p>
                  {canManageRentals && rental.status === 'completed' && (
                    <button
                      onClick={generateInvoice}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Generar Factura
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
