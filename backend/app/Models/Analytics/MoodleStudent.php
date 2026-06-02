<?php

namespace App\Models\Analytics;

class MoodleStudent extends AnalyticsModel
{
    protected $table = 'vw_moodle_students';

    protected $primaryKey = 'id';
}