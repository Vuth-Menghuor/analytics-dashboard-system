<?php

namespace App\Models\Analytics;

class MoodleCourseCompletion extends AnalyticsModel
{
    protected $table = 'mdl_course_completions';

    protected $primaryKey = 'id';
}
