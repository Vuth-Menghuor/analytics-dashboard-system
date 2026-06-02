<?php

namespace App\Models\Analytics;

class MoodleUserActivity extends AnalyticsModel
{
    protected $table = 'vw_moodle_user_activity';

    protected $primaryKey = 'userid';
}
