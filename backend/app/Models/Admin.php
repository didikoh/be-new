<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    protected $table = 'admin_list';
    protected $guarded = [];
    public $timestamps = false;
}
