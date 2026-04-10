<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseBooking extends Model
{
    protected $table = 'course_booking';
    protected $guarded = [];
    public $timestamps = false;

    public function course()
    {
        return $this->belongsTo(CourseSession::class, 'course_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
