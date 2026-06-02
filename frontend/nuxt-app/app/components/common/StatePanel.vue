<script setup lang="ts">
withDefaults(
  defineProps<{
    state: "loading" | "empty" | "error";
    title?: string;
    description?: string;
  }>(),
  {
    title: "",
    description: "",
  },
);

const { translateText } = useTranslateText();
</script>

<template>
  <UCard as="section" :ui="{ body: 'state-panel' }">
    <template v-if="state === 'loading'">
      <USkeleton class="state-skeleton-title" />
      <USkeleton class="state-skeleton-line" />
      <USkeleton class="state-skeleton-line short" />
    </template>

    <template v-else>
      <UIcon
        :name="state === 'error' ? 'i-lucide-circle-alert' : 'i-lucide-inbox'"
        class="state-icon"
      />
      <h2>
        {{
          translateText(
            title ||
              (state === "error" ? "Something went wrong" : "No data available"),
          )
        }}
      </h2>
      <p>
        {{
          translateText(
            description ||
              (state === "error"
                ? "Please try again later."
                : "Change filters or import Moodle data to see results."),
          )
        }}
      </p>
    </template>
  </UCard>
</template>
