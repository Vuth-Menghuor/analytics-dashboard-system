<script setup lang="ts">
import type { Course } from "~/types/analytics";

const props = defineProps<{
  course: Course | null;
}>();

const open = defineModel<boolean>({ default: false });
const { t } = useI18n();
const { translateText } = useTranslateText();

const institutesLabel = computed(() => {
  const institutes = props.course?.institutes?.filter(Boolean) ?? [];

  if (!institutes.length) {
    return props.course?.institute ?? "-";
  }

  return institutes.join(", ");
});

const categoriesLabel = computed(() => {
  const categories = props.course?.categories?.filter(Boolean) ?? [];

  if (!categories.length) {
    return props.course?.category ?? "-";
  }

  return categories.join(", ");
});
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="t('text.courseDetail')"
    :ui="{ content: 'max-w-4xl' }"
  >
    <template #body>
      <div v-if="course" class="profile-drawer">
        <section class="student-profile-hero">
          <div class="student-profile-avatar">
            {{ course.name.charAt(0).toUpperCase() }}
          </div>
          <div class="student-profile-identity">
            <p class="eyebrow">{{ translateText("Clean course analytics") }}</p>
            <h2>{{ course.name }}</h2>
            <div class="student-profile-meta">
              <span>
                <UIcon name="i-lucide-badge" />
                ID {{ course.id }}
              </span>
              <span>
                <UIcon name="i-lucide-folders" />
                {{ categoriesLabel }}
              </span>
              <span>
                <UIcon name="i-lucide-building-2" />
                {{ course.institute }}
              </span>
            </div>
          </div>
        </section>

        <section class="profile-stat-grid student-profile-stats">
          <div>
            <span>{{ translateText("Enrollment records") }}</span>
            <strong>{{ course.enrolled.toLocaleString() }}</strong>
          </div>
          <div>
            <span>{{ translateText("Moodle course records") }}</span>
            <strong>{{ course.courseCount ?? 1 }}</strong>
          </div>
          <div>
            <span>{{ translateText("Categories") }}</span>
            <strong>{{ course.categoryCount ?? 1 }}</strong>
          </div>
          <div>
            <span>{{ translateText("Institutes") }}</span>
            <strong>{{ course.instituteCount ?? 0 }}</strong>
          </div>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-info" />
              {{ translateText("Course Summary") }}
            </h3>
            <p>
              {{ translateText("This summary explains what the grouped analytics course represents.") }}
            </p>
          </div>

          <dl class="student-profile-details">
            <div>
              <dt>{{ translateText("Course ID") }}</dt>
              <dd>{{ course.id }}</dd>
            </div>
            <div>
              <dt>{{ translateText("Course name") }}</dt>
              <dd>{{ course.name }}</dd>
            </div>
            <div>
              <dt>{{ translateText("Categories") }}</dt>
              <dd>{{ categoriesLabel }}</dd>
            </div>
            <div>
              <dt>{{ translateText("Institutes") }}</dt>
              <dd>{{ institutesLabel }}</dd>
            </div>
            <div>
              <dt>{{ translateText("Grouped Moodle records") }}</dt>
              <dd>{{ course.courseCount ?? 1 }}</dd>
            </div>
          </dl>
        </section>

        <section class="student-profile-section">
          <div class="section-heading compact">
            <h3 class="section-title with-icon">
              <UIcon name="i-lucide-list-tree" />
              {{ translateText("Original Moodle Courses") }}
            </h3>
            <p>
              {{ translateText("These are the original Moodle course records included in this cleaned course group.") }}
            </p>
          </div>

          <div class="dashboard-data-table-wrap">
            <table class="dashboard-data-table course-moodle-records-table">
              <thead>
                <tr>
                  <th scope="col">{{ translateText("Moodle ID") }}</th>
                  <th scope="col">{{ translateText("Original Course Name") }}</th>
                  <th scope="col">{{ translateText("Short Name") }}</th>
                  <th scope="col">{{ translateText("Category") }}</th>
                  <th scope="col">{{ translateText("Enrollments") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="moodleCourse in course.moodleCourses ?? []"
                  :key="moodleCourse.id"
                >
                  <td>{{ moodleCourse.id }}</td>
                  <th scope="row" :title="moodleCourse.originalName">
                    {{ moodleCourse.originalName }}
                  </th>
                  <td :title="moodleCourse.shortName">
                    {{ moodleCourse.shortName }}
                  </td>
                  <td :title="moodleCourse.category">
                    {{ moodleCourse.category }}
                  </td>
                  <td class="number">
                    {{ moodleCourse.enrollments.toLocaleString() }}
                  </td>
                </tr>
                <tr v-if="!(course.moodleCourses ?? []).length">
                  <td colspan="5" class="muted-text">
                    {{ translateText("No original Moodle course records found for this group.") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>
  </USlideover>
</template>
