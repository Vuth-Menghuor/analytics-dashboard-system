<script setup lang="ts">
import { genderByInstitution } from "~/constants/dashboard";

const numberFormatter = new Intl.NumberFormat("en-US");

const formatNumber = (value: number) => numberFormatter.format(value);
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
