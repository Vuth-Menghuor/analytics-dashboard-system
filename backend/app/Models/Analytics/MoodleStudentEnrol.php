<?php

namespace App\Models\Analytics;

class MoodleStudentEnrol extends AnalyticsModel
{
    protected $table = 'mdl_student_enrol';

    protected $primaryKey = 'username';

    public $incrementing = false;

    protected $keyType = 'string';
}