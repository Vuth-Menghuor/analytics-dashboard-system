<?php

namespace App\Models\Analytics;

class MoodleEnrollment extends AnalyticsModel
{
    protected $table = 'vw_moodle_enrollments';

    protected $primaryKey = 'enrolment_id';
}
