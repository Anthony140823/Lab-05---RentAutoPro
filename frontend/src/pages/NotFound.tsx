import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Página No Encontrada
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Ir al Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver Atrás
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Si crees que esto es un error, por favor contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
