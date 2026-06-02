import type { ComputedRef, Ref } from "vue";

type PaginationSource<T> = Ref<T[]> | ComputedRef<T[]>;

export function usePagination<T>(
  data: PaginationSource<T>,
  defaultPerPage = 10,
) {
  const page = ref(1);
  const perPage = ref(defaultPerPage);

  const total = computed(() => data.value.length);

  const items = computed(() => {
    const start = (page.value - 1) * perPage.value;

    return data.value.slice(start, start + perPage.value);
  });

  watch(perPage, () => {
    page.value = 1;
  });

  watch(total, () => {
    const lastPage = Math.max(Math.ceil(total.value / perPage.value), 1);

    if (page.value > lastPage) {
      page.value = lastPage;
    }
  });

  return {
    page,
    perPage,
    total,
    items,
  };
}
