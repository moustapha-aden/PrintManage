<?php

namespace App\Http\Controllers;

use App\Models\Inventaire;
use App\Models\Materielle;
use App\Models\Printer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventaireController extends Controller
{
    /**
     * Liste tous les inventaires avec leurs relations.
     */
    public function index()
    {
        $inventaires = Inventaire::with([
            'materiel',
            'printer.company',
            'printer.department',
            'company',
            'department'
        ])->get();

        return response()->json($inventaires);
    }

    /**
     * Ajoute un nouvel inventaire et met à jour le stock.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'materiel_id' => 'required|exists:materielles,id',
            'quantite' => 'required|integer|min:1',
            'printer_id' => 'nullable|exists:printers,id',
            'date_deplacement' => 'required|date',
            'company_id' => 'nullable|exists:companies,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        // Validation personnalisée : soit printer_id, soit (company_id ET department_id)
        if (!$validated['printer_id'] && (!$validated['company_id'] || !$validated['department_id'])) {
            return response()->json([
                'message' => 'Vous devez fournir soit une imprimante, soit une société et un département.'
            ], 400);
        }

        // Si une imprimante est fournie, s'assurer que company_id et department_id sont null
        if ($validated['printer_id']) {
            $validated['company_id'] = null;
            $validated['department_id'] = null;
        } else {
            // Si pas d'imprimante, s'assurer que printer_id est null
            $validated['printer_id'] = null;
        }

        DB::beginTransaction();
        try {
            $materielle = Materielle::find($validated['materiel_id']);

            if (!$materielle) {
                return response()->json(['message' => 'Matériel non trouvé.'], 404);
            }

            if ($materielle->quantite < $validated['quantite']) {
                return response()->json(['message' => 'Quantité insuffisante en stock.'], 400);
            }

            // Met à jour la quantité disponible
            $materielle->decrement('quantite', $validated['quantite']);
            $materielle->increment('sortie', $validated['quantite']); // Pour suivi des sorties

            // Crée l'entrée d'inventaire
            $inventaire = Inventaire::create($validated);

            DB::commit();

            return response()->json([
                'message' => 'Inventaire ajouté avec succès.',
                'data' => $inventaire
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de l\'inventaire.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affiche un inventaire spécifique.
     */
    public function show($id)
    {
        $inventaire = Inventaire::with([
            'materiel',
            'printer.company',
            'printer.department',
            'company',
            'department'
        ])->find($id);

        if (!$inventaire) {
            return response()->json(['message' => 'Inventaire non trouvé.'], 404);
        }

        return response()->json($inventaire);
    }

    /**
     * Met à jour un inventaire.
     */
    public function update(Request $request, $id)
    {
        $inventaire = Inventaire::find($id);

        if (!$inventaire) {
            return response()->json(['message' => 'Inventaire non trouvé.'], 404);
        }

        $validated = $request->validate([
            'materiel_id' => 'sometimes|exists:materielles,id',
            'quantite' => 'sometimes|integer|min:1',
            'printer_id' => 'nullable|exists:printers,id',
            'date_deplacement' => 'sometimes|date',
            'company_id' => 'nullable|exists:companies,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        // Déterminer les valeurs finales après merge avec les données existantes
        $finalPrinterId = $validated['printer_id'] ?? $inventaire->printer_id;
        $finalCompanyId = $validated['company_id'] ?? $inventaire->company_id;
        $finalDepartmentId = $validated['department_id'] ?? $inventaire->department_id;

        // Validation personnalisée : soit printer_id, soit (company_id ET department_id)
        if (!$finalPrinterId && (!$finalCompanyId || !$finalDepartmentId)) {
            return response()->json([
                'message' => 'Vous devez fournir soit une imprimante, soit une société et un département.'
            ], 400);
        }

        // Si une imprimante est fournie, s'assurer que company_id et department_id sont null
        if ($finalPrinterId) {
            $validated['company_id'] = null;
            $validated['department_id'] = null;
        } else {
            // Si pas d'imprimante, s'assurer que printer_id est null
            $validated['printer_id'] = null;
        }

        // Utilisation d'une transaction pour garantir la cohérence
        DB::beginTransaction();
        try {
            $oldMaterielId = $inventaire->materiel_id;
            $oldQuantite = $inventaire->quantite;
            $newMaterielId = $validated['materiel_id'] ?? $oldMaterielId;
            $newQuantite = $validated['quantite'] ?? $oldQuantite;

            // Si on change le matériel ou la quantité, on ajuste le stock
            if ($oldMaterielId != $newMaterielId || $oldQuantite != $newQuantite) {
                // Restaurer le stock de l'ancien matériel
                $oldMateriel = Materielle::find($oldMaterielId);
                if ($oldMateriel) {
                    $oldMateriel->increment('quantite', $oldQuantite);
                    $oldMateriel->decrement('sortie', $oldQuantite);
                }

                // Déduire du nouveau matériel
                $newMateriel = Materielle::find($newMaterielId);
                if (!$newMateriel) {
                    DB::rollBack();
                    return response()->json(['message' => 'Matériel non trouvé.'], 404);
                }

                // Vérifier le stock disponible
                if ($newMateriel->quantite < $newQuantite) {
                    DB::rollBack();
                    return response()->json(['message' => 'Quantité insuffisante en stock.'], 400);
                }

                // Déduire la nouvelle quantité
                $newMateriel->decrement('quantite', $newQuantite);
                $newMateriel->increment('sortie', $newQuantite);
            }

            $inventaire->update($validated);
            DB::commit();

            return response()->json([
                'message' => 'Inventaire mis à jour avec succès.',
                'data' => $inventaire->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime un inventaire et rétablit le stock.
     */
    public function destroy($id)
    {
        $inventaire = Inventaire::find($id);

        if (!$inventaire) {
            return response()->json(['message' => 'Inventaire non trouvé.'], 404);
        }

        DB::beginTransaction();
        try {
            // Rétablir le stock du matériel supprimé
            $materiel = Materielle::find($inventaire->materiel_id);
            if ($materiel) {
                $materiel->increment('quantite', $inventaire->quantite);
                $materiel->decrement('sortie', $inventaire->quantite);
            }

            $inventaire->delete();

            DB::commit();

            return response()->json(['message' => 'Inventaire supprimé avec succès.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'inventaire.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
