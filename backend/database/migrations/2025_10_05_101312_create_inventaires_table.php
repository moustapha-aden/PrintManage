<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materiel_id')->constrained('materielles')->onDelete('cascade');
            $table->integer('quantite');
            $table->foreignId('printer_id')->nullable()->constrained('printers')->onDelete('cascade');
            $table->foreignId('company_id')->nullable()->constrained('companies'); // ID de la société, clé étrangère
            $table->foreignId('department_id')->nullable()->constrained('departments'); // ID du département, clé étrangère
            $table->date('date_deplacement');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventaires');
    }
};
