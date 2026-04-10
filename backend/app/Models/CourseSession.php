<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseSession extends Model
{
    protected $table = 'course_session';
    protected $guarded = [];
    public $timestamps = false;

    public function coach()
    {
        return $this->belongsTo(Coach::class, 'coach_id');
    }
}
