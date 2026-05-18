<script setup lang="ts">
import AnalyticsChartCard from "~/components/charts/AnalyticsChartCard.vue";
import StatePanel from "~/components/common/StatePanel.vue";
import StudentProfileDrawer from "~/components/students/StudentProfileDrawer.vue";
import { useStudentAnalyticsView } from "~/composables/students/useStudentAnalyticsView";

const {
  activityTimeline,
  atRiskStudents,
  charts,
  cities,
  departments,
  error,
  filters,
  genderOptions,
  heroStats,
  institutes,
  isLoading,
  metrics,
  profileOpen,
  refresh,
  selectedStudent,
  statusOptions,
  table,
  topStudents,
  viewStudent,
} = useStudentAnalyticsView();
</script>

<template>
  <div class="page-stack">
    <PageHeader
      eyebrow="Static Moodle sample"
      title="Student Analytics"
      copy="Explore a sample Moodle student analytics screen with searchable user records, institute filters, engagement summaries, profile details, risk signals, grades, attendance, and activity snapshots."
    >
      <div class="toolbar">
        <UBadge color="primary" variant="soft">Static sample data</UBadge>
        <UBadge color="neutral" variant="soft">GET /api/students later</UBadge>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          label="Reload sample"
          @click="refresh"
        />
      </div>
    </PageHeader>

    <StatePanel v-if="isLoading" state="loading" />
    <StatePanel v-else-if="error" state="error" :description="error" />

    <template v-else>
      <section class="student-sample-hero">
        <div>
          <p class="eyebrow">Sample cohort overview</p>
          <h2>Moodle Learning Behavior Cohort</h2>
          <p>
            This static sample combines fields from mdl_user,
            mdl_user_enrolments, mdl_course_completions, mdl_grade_grades,
            mdl_logstore_standard_log, mdl_user_lastaccess, and attendance
            records.
          </p>
        </div>
        <div class="student-sample-hero-stats">
          <div v-for="stat in heroStats" :key="stat.label">
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </div>
        </div>
      </section>

      <UCard :ui="{ body: 'analytics-filter-bar' }">
        <div class="analytics-filter-field wide">
          <label>Search</label>
          <UInput
            v-model="filters.query"
            icon="i-lucide-search"
            placeholder="Search name, email, or username"
          />
        </div>
        <div class="analytics-filter-field">
          <label>Institute</label>
          <USelect v-model="filters.institute" :items="institutes" />
        </div>
        <div class="analytics-filter-field">
          <label>Department</label>
          <USelect v-model="filters.department" :items="departments" />
        </div>
        <div class="analytics-filter-field">
          <label>City</label>
          <USelect v-model="filters.city" :items="cities" />
        </div>
        <div class="analytics-filter-field">
          <label>Gender</label>
          <USelect
            v-model="filters.gender"
            :items="genderOptions"
          />
        </div>
        <div class="analytics-filter-field">
          <label>Status</label>
          <USelect
            v-model="filters.status"
            :items="statusOptions"
          />
        </div>
      </UCard>

      <section class="grid metrics">
        <MetricCard
          v-for="metricItem in metrics"
          :key="metricItem.label"
          :metric="metricItem"
        />
      </section>

      <section class="grid student-insight-grid">
        <UCard as="article" :ui="{ body: 'student-insight-panel' }">
          <div class="section-heading compact">
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-trophy" />
              Top Performing Students
            </h2>
            <p>Ranked by current average grade.</p>
          </div>
          <div class="student-rank-list">
            <div v-for="(student, index) in topStudents" :key="student.id">
              <span>{{ index + 1 }}</span>
              <strong>{{ student.name }}</strong>
              <em>{{ student.averageGrade }}%</em>
            </div>
          </div>
        </UCard>

        <UCard as="article" :ui="{ body: 'student-insight-panel' }">
          <div class="section-heading compact">
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-triangle-alert" />
              Students Needing Follow-up
            </h2>
            <p>High risk or suspended accounts.</p>
          </div>
          <div class="student-risk-list">
            <div v-for="student in atRiskStudents" :key="student.id">
              <div>
                <strong>{{ student.name }}</strong>
                <span>{{ student.institute }} · {{ student.department }}</span>
              </div>
              <UBadge
                :color="student.riskLevel === 'High' ? 'warning' : 'neutral'"
                variant="soft"
              >
                {{ student.riskLevel }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <UCard as="article" :ui="{ body: 'student-insight-panel' }">
          <div class="section-heading compact">
            <h2 class="section-title with-icon">
              <UIcon name="i-lucide-clock-3" />
              Daily Activity Timeline
            </h2>
            <p>Sample events from Moodle logs.</p>
          </div>
          <div class="student-timeline">
            <div v-for="event in activityTimeline" :key="event.time">
              <span>{{ event.time }}</span>
              <div>
                <strong>{{ event.title }}</strong>
                <p>{{ event.meta }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section class="grid analytics-chart-grid">
        <AnalyticsChartCard
          v-for="chart in charts"
          :key="chart.title"
          :chart="chart"
        />
      </section>

      <DashboardDataTable
        :title="table.title"
        :icon="table.icon"
        :description="table.description"
        :columns="table.columns"
        :rows="table.rows"
        :row-key="table.rowKey"
        min-width="1280px"
      >
        <template #cell-action="{ value }">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-eye"
            label="View"
            @click="viewStudent(value)"
          />
        </template>
      </DashboardDataTable>
    </template>

    <StudentProfileDrawer v-model="profileOpen" :student="selectedStudent" />
  </div>
</template>
