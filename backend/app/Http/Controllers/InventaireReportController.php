<?php

namespace App\Http\Controllers;

use App\Models\Inventaire;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InventaireReportController extends Controller
{
    public function generateReport(Request $request)
    {
        Log::info('Début génération rapport inventaires', ['request' => $request->all()]);

        // Récupérer tous les inventaires avec leurs relations
        $inventaires = Inventaire::with([
            'materiel',
            'printer.company',
            'printer.department',
            'company',
            'department'
        ])->orderBy('created_at', 'desc')->get();

        if ($inventaires->isEmpty()) {
            Log::warning('Aucun inventaire trouvé.');
        }

        // Calculs globaux
        $totalInventaires = $inventaires->count();
        $totalQuantite = $inventaires->sum('quantite');
        $totalMateriels = $inventaires->pluck('materiel_id')->unique()->count();

        // Préparer les données pour la vue
        $data = [
            'inventaires' => $inventaires,
            'totalInventaires' => $totalInventaires,
            'totalQuantite' => $totalQuantite,
            'totalMateriels' => $totalMateriels,
            'generationDate' => now()->format('d/m/Y H:i'),
        ];

        // Génération PDF
        $pdf = Pdf::loadView('reports.inventaire_report', $data);

        // Nom du fichier
        $filename = 'rapport_inventaires_' . now()->format('Y-m-d') . '.pdf';

        return $pdf->stream($filename);
    }
}

