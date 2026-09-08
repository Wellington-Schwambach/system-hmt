<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LogisticsLocationType extends Model { protected $fillable = ['name','normalized_name','scope','active']; protected function casts(): array { return ['active'=>'boolean']; } }
