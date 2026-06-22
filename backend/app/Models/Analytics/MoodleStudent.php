<?php

namespace App\Models\Analytics;

class MoodleStudent extends AnalyticsModel
{
    protected $table = 'analytics_clean.students';

    protected $primaryKey = 'id';
}
