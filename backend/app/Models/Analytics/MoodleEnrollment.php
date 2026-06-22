<?php

namespace App\Models\Analytics;

class MoodleEnrollment extends AnalyticsModel
{
    protected $table = 'analytics_clean.enrollments';

    protected $primaryKey = 'enrolment_id';
}
