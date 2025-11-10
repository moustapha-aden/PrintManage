<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport de Production Imprimantes</title>
    <style>
        @page {
            margin: 20mm;
        }
        body { font-family: 'Arial', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; page-break-after: avoid; }
        .summary {
            background: #f9f9f9;
            border: 1px solid #ccc;
            padding: 15px;
            border-radius: 8px;
            margin-top: 30px;
            page-break-after: avoid;
        }
        .summary h2 { text-align: center; margin-bottom: 10px; font-size: 16px; }
        .page-group {
            page-break-inside: avoid;
            margin-bottom: 20px;
        }
        .page-group:not(:last-child) {
            page-break-after: always;
        }
        .section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
            page-break-inside: avoid;
        }
        .section:last-child {
            margin-bottom: 0;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: avoid; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .highlight-red { color: red; font-weight: bold; }
        .highlight-green { color: green; font-weight: bold; }
    </style>
</head>
<body>
    @php
        \Carbon\Carbon::setLocale('fr');
        setlocale(LC_TIME, 'fr_FR.utf8', 'fra');
    @endphp
    <div class="header">
        <h1>Rapport de Production</h1>
        <p>Période : {{ $startDate }} - {{ $endDate }}</p>
        @if($company)
            <p>Société : {{ $company->name }}</p>
        @endif
    </div>

    <div class="summary" style="margin-bottom: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
        <h2>Résumé Global</h2>
        <table>
            <tr><th>Total Copies N&B</th><td class="{{ ($totalDepassementBW ?? 0) > 0 ? 'highlight-red' : 'highlight-green' }}">{{ $totalDepassementBW }}</td></tr>
            <tr><th>Total Copies Couleur</th><td class="{{ ($totalDepassementColor ?? 0) > 0 ? 'highlight-red' : 'highlight-green' }}">{{ $totalDepassementColor }}</td></tr>
            <tr><th>Total Imprimantes</th><td>{{ $totalPrinters }}</td></tr>
        </table>
    </div>

    @forelse($quotas->chunk(2) as $chunk)
        <div class="page-group">
            @foreach($chunk as $quota)
                <div class="section">
                    <h2>Imprimante : {{ $quota->printer?->brand }} {{ $quota->printer?->model }} ({{ $quota->printer?->serial }})</h2>
                    <table>
                        <tr><th>Mois</th><td>{{ \Carbon\Carbon::parse($quota->mois)->translatedFormat('F Y') }}</td></tr>
                        <tr><th>Département</th><td>{{ $quota->printer?->department?->name ?? 'N/A' }}</td></tr>
                        <tr><th>Total copies</th><td>{{ $quota->total_quota }}</td></tr>
                        <tr><th>Dépassement N&B</th>
                            <td class="{{ ($quota->depassementBW ?? 0) > 0 ? 'highlight-red' : 'highlight-green' }}">
                                {{ $quota->depassementBW ?? 0 }}
                            </td>
                        </tr>
                        <tr><th>Dépassement Couleur</th>
                            <td class="{{ ($quota->depassementColor ?? 0) > 0 ? 'highlight-red' : 'highlight-green' }}">
                                {{ $quota->depassementColor ?? 0 }}
                            </td>
                        </tr>
                    </table>
                </div>
            @endforeach
        </div>
    @empty
        <p>Aucun quota trouvé pour cette période.</p>
    @endforelse


</body>
</html>
