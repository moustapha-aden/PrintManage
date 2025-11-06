<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport des Inventaires</title>
    <style>
        body { font-family: 'Arial', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .summary { background: #f9f9f9; border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        .summary h2 { text-align: center; margin-bottom: 10px; font-size: 16px; }
        .data-table { margin-top: 20px; }
        .data-table th { background-color: #dc3545; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport des Déplacements de Matériels</h1>
    </div>

    <div class="summary">
        <h2>Résumé Global</h2>
        <table>
            <tr><th>Total Déplacements</th><td>{{ $totalInventaires }}</td></tr>
            <tr><th>Total Quantité Déplacée</th><td>{{ $totalQuantite }}</td></tr>
            <tr><th>Total Matériels Différents</th><td>{{ $totalMateriels }}</td></tr>
        </table>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>Référence</th>
                    <th>Matériel</th>
                    <th>Type</th>
                    <th>Quantité</th>
                    <th>Date Déplacement</th>
                    <th>Destination</th>
                    <th>Société</th>
                    <th>Département</th>
                </tr>
            </thead>
            <tbody>
                @forelse($inventaires as $inventaire)
                    <tr>
                        <td>{{ $inventaire->materiel?->reference ?? 'N/A' }}</td>
                        <td>{{ $inventaire->materiel?->name ?? 'N/A' }}</td>
                        <td>{{ $inventaire->materiel?->type ?? 'N/A' }}</td>
                        <td>{{ $inventaire->quantite }}</td>
                        <td>{{ \Carbon\Carbon::parse($inventaire->date_deplacement)->format('d/m/Y') }}</td>
                        <td>
                            @if($inventaire->printer)
                                Imprimante: {{ $inventaire->printer->brand ?? '' }} {{ $inventaire->printer->model ?? '' }} ({{ $inventaire->printer->serial ?? 'N/A' }})
                            @else
                                Stock
                            @endif
                        </td>
                        <td>
                            @if($inventaire->printer && $inventaire->printer->company)
                                {{ $inventaire->printer->company->name }}
                            @elseif($inventaire->company)
                                {{ $inventaire->company->name }}
                            @else
                                N/A
                            @endif
                        </td>
                        <td>
                            @if($inventaire->printer && $inventaire->printer->department)
                                {{ $inventaire->printer->department->name }}
                            @elseif($inventaire->department)
                                {{ $inventaire->department->name }}
                            @else
                                N/A
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 20px;">
                            <p>Aucun inventaire trouvé.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</body>
</html>

