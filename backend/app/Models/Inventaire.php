<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventaire extends Model
{
    use HasFactory;
    protected $fillable = [
        'materiel_id',
        'quantite',
        'printer_id',
        'date_deplacement',
        'company_id',
        'department_id',
    ];
    public function materiel()
    {
        return $this->belongsTo(Materielle::class, 'materiel_id');
    }

    public function printer()
    {
        return $this->belongsTo(Printer::class, 'printer_id');
    }
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
