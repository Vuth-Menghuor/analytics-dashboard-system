<?php

namespace App\Models\Analytics;

class MoodleUserActivity extends AnalyticsModel
{
    protected $table = 'analytics_clean.user_activity';

    protected $primaryKey = 'userid';
}
