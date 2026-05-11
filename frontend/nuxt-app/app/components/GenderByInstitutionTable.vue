<script setup lang="ts">
const genderByInstitution = [
  { institution: "ITC", male: 2520, female: 1680, total: 4200, malePercent: 60, femalePercent: 40 },
  { institution: "RUPP", male: 2090, female: 1710, total: 3800, malePercent: 55, femalePercent: 45 },
  { institution: "NUM", male: 1450, female: 1450, total: 2900, malePercent: 50, femalePercent: 50 },
  { institution: "URDSE", male: 720, female: 480, total: 1200, malePercent: 60, femalePercent: 40 },
  { institution: "NPIC", male: 454, female: 293, total: 747, malePercent: 60.8, femalePercent: 39.2 },
];

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;
</script>

<template>
  <UCard
    as="section"
    class="analytics-card gender-institution-card"
    :ui="{ body: 'analytics-card-body' }"
  >
    <div class="section-heading">
      <h2 class="section-title with-icon">
        <UIcon name="i-lucide-building-2" />
        Gender by Institution
      </h2>
      <p>Detailed breakdown by institution</p>
    </div>

    <div class="gender-table-wrap">
      <table class="gender-institution-table">
        <colgroup>
          <col class="institution-col">
          <col class="count-col">
          <col class="count-col">
          <col class="count-col">
          <col class="percent-col">
          <col class="percent-col">
          <col class="distribution-col">
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Institution</th>
            <th scope="col">Male</th>
            <th scope="col">Female</th>
            <th scope="col">Total</th>
            <th scope="col">Male %</th>
            <th scope="col">Female %</th>
            <th scope="col" class="distribution-heading">Distribution</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="institution in genderByInstitution"
            :key="institution.institution"
          >
            <th scope="row">{{ institution.institution }}</th>
            <td class="number male-text">{{ formatNumber(institution.male) }}</td>
            <td class="number female-text">{{ formatNumber(institution.female) }}</td>
            <td class="number total-text">{{ formatNumber(institution.total) }}</td>
            <td class="number">{{ formatPercent(institution.malePercent) }}</td>
            <td class="number">{{ formatPercent(institution.femalePercent) }}</td>
            <td class="distribution-cell">
              <div
                class="distribution-bar"
                :aria-label="`${institution.institution}: ${formatPercent(institution.malePercent)} male, ${formatPercent(institution.femalePercent)} female`"
              >
                <span
                  class="distribution-male"
                  :style="{ width: `${institution.malePercent}%` }"
                />
                <span class="distribution-female" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
