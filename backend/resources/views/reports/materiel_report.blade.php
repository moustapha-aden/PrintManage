<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport des Matériels</title>
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
        .highlight-low { color: orange; font-weight: bold; }
        .highlight-zero { color: red; font-weight: bold; }
        .highlight-high { color: green; font-weight: bold; }

    </style>
</head>
<body>
    <div class="header">
        <h1>Inventaires des Matériels</h1>
        <p>Généré le : {{ $generationDate }}</p>
    </div>

    <div class="summary">
        <h2>Résumé Global par Type</h2>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Nombre Matériels</th>
                    <th>Quantité en Stock</th>
                    <th>Quantité Sortie</th>
                    <th>Déplacements</th>
                </tr>
            </thead>
            <tbody>
                @forelse($statsByType as $type => $stats)
                    <tr>
                        <td><strong>{{ $type }}</strong></td>
                        <td>{{ $stats['count'] }}</td>
                        <td>{{ $stats['quantite'] }}</td>
                        <td>{{ $stats['sortie'] }}</td>
                        <td>{{ $stats['inventaires'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 10px;">
                            <p>Aucun type trouvé.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="data-table">
        <table>
            <thead>
                <tr>
                    <th>Référence</th>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Quantité Stock</th>
                    <th>Quantité Sortie</th>
                    <th>Nombre Déplacements</th>
                    <th>Total Déplacé</th>
                </tr>
            </thead>
            <tbody>
                @forelse($materielles as $materielle)
                    @php
                        $totalDeplace = $materielle->inventaires->sum('quantite');
                        $nbDeplacements = $materielle->inventaires->count();
                    @endphp
                    <tr>
                        <td>{{ $materielle->reference }}</td>
                        <td>{{ $materielle->name }}</td>
                        <td>{{ $materielle->type }}</td>
                        <td class="{{ $materielle->quantite <= 0 ? 'highlight-zero' : ($materielle->quantite <= 5 ? 'highlight-low' : 'highlight-high') }}">
                            {{ $materielle->quantite }}
                        </td>
                        <td>{{ $materielle->sortie ?? 0 }}</td>
                        <td>{{ $nbDeplacements }}</td>
                        <td>{{ $totalDeplace }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px;">
                            <p>Aucun matériel trouvé.</p>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</body>
</html>

