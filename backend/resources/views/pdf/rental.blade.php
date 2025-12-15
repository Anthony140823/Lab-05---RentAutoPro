<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Alquiler - {{ $rental->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #4F46E5;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 5px;
        }
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            width: 150px;
        }
        .info-value {
            flex: 1;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table th, .table td {
            border: 1px solid #E5E7EB;
            padding: 8px;
            text-align: left;
        }
        .table th {
            background-color: #F3F4F6;
            font-weight: bold;
        }
        .total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            color: #4F46E5;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            font-size: 10px;
            color: #6B7280;
        }
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company['name'] }}</div>
        <div>{{ $company['address'] }}</div>
        <div>Tel: {{ $company['phone'] }} | Email: {{ $company['email'] }}</div>
    </div>

    <h2 style="text-align: center; color: #4F46E5;">CONTRATO DE ALQUILER DE VEHÍCULO</h2>
    <p style="text-align: center; margin-bottom: 30px;">No. {{ $rental->id }}</p>

    <div class="section">
        <div class="section-title">Información del Cliente</div>
        <div class="info-row">
            <div class="info-label">Nombre:</div>
            <div class="info-value">{{ $rental->customer->first_name }} {{ $rental->customer->last_name }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">{{ $rental->customer->email }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Teléfono:</div>
            <div class="info-value">{{ $rental->customer->phone ?? 'N/A' }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Información del Vehículo</div>
        <div class="info-row">
            <div class="info-label">Marca y Modelo:</div>
            <div class="info-value">{{ $rental->vehicle->make }} {{ $rental->vehicle->model }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Año:</div>
            <div class="info-value">{{ $rental->vehicle->year }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Placa:</div>
            <div class="info-value">{{ $rental->vehicle->license_plate }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Color:</div>
            <div class="info-value">{{ $rental->vehicle->color ?? 'N/A' }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Kilometraje Inicial:</div>
            <div class="info-value">{{ number_format($rental->start_mileage ?? $rental->vehicle->current_mileage, 2) }} km</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Detalles del Alquiler</div>
        <table class="table">
            <tr>
                <th>Concepto</th>
                <th>Detalle</th>
            </tr>
            <tr>
                <td>Fecha de Inicio</td>
                <td>{{ \Carbon\Carbon::parse($rental->start_date)->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td>Fecha de Fin</td>
                <td>{{ \Carbon\Carbon::parse($rental->end_date)->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td>Duración</td>
                <td>{{ \Carbon\Carbon::parse($rental->start_date)->diffInDays(\Carbon\Carbon::parse($rental->end_date)) + 1 }} días</td>
            </tr>
            <tr>
                <td>Tarifa Diaria</td>
                <td>${{ number_format($rental->daily_rate, 2) }}</td>
            </tr>
            <tr>
                <td><strong>Total a Pagar</strong></td>
                <td><strong>${{ number_format($rental->total_amount, 2) }}</strong></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Términos y Condiciones</div>
        <ol style="font-size: 10px; line-height: 1.4;">
            <li>El arrendatario se compromete a devolver el vehículo en las mismas condiciones en que lo recibió.</li>
            <li>El arrendatario es responsable de cualquier daño causado al vehículo durante el período de alquiler.</li>
            <li>El vehículo debe ser devuelto con el mismo nivel de combustible con el que fue entregado.</li>
            <li>Cualquier multa de tránsito incurrida durante el período de alquiler será responsabilidad del arrendatario.</li>
            <li>El arrendatario debe tener una licencia de conducir válida durante todo el período de alquiler.</li>
            <li>En caso de accidente, el arrendatario debe notificar inmediatamente a RentAutoPro.</li>
        </ol>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">
                Firma del Arrendatario
            </div>
            <div style="margin-top: 10px;">{{ $rental->customer->first_name }} {{ $rental->customer->last_name }}</div>
        </div>
        <div class="signature-box">
            <div class="signature-line">
                Firma del Representante
            </div>
            <div style="margin-top: 10px;">RentAutoPro</div>
        </div>
    </div>

    <div class="footer">
        <p>Este documento fue generado electrónicamente el {{ now()->format('d/m/Y H:i:s') }}</p>
        <p>{{ $company['name'] }} - Todos los derechos reservados</p>
    </div>
</body>
</html>
