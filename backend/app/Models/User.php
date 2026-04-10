<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'user_list';
    protected $guarded = [];
    public $timestamps = false;

    public function student()
    {
        return $this->hasOne(Student::class, 'user_id');
    }

    public function coach()
    {
        return $this->hasOne(Coach::class, 'user_id');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class, 'user_id');
    }
}
