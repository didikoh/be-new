<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCard extends Model
{
    protected $table = 'user_cards';
    protected $guarded = [];
    public $timestamps = false;
}
