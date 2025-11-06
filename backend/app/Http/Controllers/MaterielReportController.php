<?php

namespace App\Http\Controllers;

use App\Models\Materielle;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MaterielReportController extends Controller
{
    public function generateReport(Request $request)
    {
        Log::info('Début génération rapport matériels', ['request' => $request->all()]);

        // Récupérer tous les matériels avec leurs inventaires (déplacements)
        $materielles = Materielle::with([
            'inventaires.printer.company',
            'inventaires.printer.department',
            'inventaires.company',
            'inventaires.department'
        ])->orderBy('created_at', 'desc')->get();

        if ($materielles->isEmpty()) {
            Log::warning('Aucun matériel trouvé.');
        }

        // Calculs globaux
        $totalMateriels = $materielles->count();
        $totalQuantite = $materielles->sum('quantite');
        $totalSortie = $materielles->sum('sortie');
        $totalInventaires = $materielles->sum(function ($materielle) {
            return $materielle->inventaires->count();
        });

        // Calculs par type
        $statsByType = [];
        foreach ($materielles as $materielle) {
            $type = $materielle->type ?? 'N/A';

            if (!isset($statsByType[$type])) {
                $statsByType[$type] = [
                    'count' => 0,
                    'quantite' => 0,
                    'sortie' => 0,
                    'inventaires' => 0,
                ];
            }

            $statsByType[$type]['count']++;
            $statsByType[$type]['quantite'] += $materielle->quantite ?? 0;
            $statsByType[$type]['sortie'] += $materielle->sortie ?? 0;
            $statsByType[$type]['inventaires'] += $materielle->inventaires->count();
        }

        // Préparer les données pour la vue
        $data = [
            'materielles' => $materielles,
            'totalMateriels' => $totalMateriels,
            'totalQuantite' => $totalQuantite,
            'totalSortie' => $totalSortie,
            'totalInventaires' => $totalInventaires,
            'statsByType' => $statsByType,
            'generationDate' => now()->format('d/m/Y H:i'),
        ];

        // Génération PDF
        $pdf = Pdf::loadView('reports.materiel_report', $data);

        // Nom du fichier
        $filename = 'rapport_materiels_' . now()->format('Y-m-d') . '.pdf';

        return $pdf->stream($filename);
    }
}

