import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  TruckIcon,
  CalendarIcon,
  WrenchIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Vehículos', href: '/vehicles', icon: TruckIcon },
  { name: 'Alquileres', href: '/rentals', icon: CalendarIcon },
  { name: 'Mantenimiento', href: '/maintenance', icon: WrenchIcon },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
];

const userNavigation = [
  { name: 'Perfil', href: '/profile', icon: UserIcon },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <h1 className="text-xl font-bold text-gray-900">RentAutoPro</h1>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${location.pathname === item.href
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${location.pathname === item.href
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
            <div className="flex h-16 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">RentAutoPro</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${location.pathname === item.href
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${location.pathname === item.href
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200 lg:hidden">
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-end px-4 sm:px-6 lg:px-8">
              <div className="ml-3 flex items-center">
                <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                  Modo Público
                </span>
              </div>
            </div>
          </div>

          {/* Desktop top bar */}
          <div className="hidden lg:flex lg:h-16 lg:shrink-0 lg:bg-white lg:border-b lg:border-gray-200">
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex flex-1"></div>
              <div className="ml-4 flex items-center lg:ml-6">
                <span className="text-sm text-gray-500 italic">
                  Vista de Concesionaria (Acceso Público)
                </span>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
