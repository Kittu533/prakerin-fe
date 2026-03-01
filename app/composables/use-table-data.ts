/**
 * Reusable composable for table data management
 * Handles filtering, pagination, and search
 */
export function useTableData<T>(items: Ref<T[]>, searchQuery: Ref<string>) {
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;
    const query = searchQuery.value.toLowerCase();

    // Default filter - checks all string properties
    return items.value.filter((item: any) =>
      Object.values(item).some((val: any) =>
        String(val).toLowerCase().includes(query),
      ),
    );
  });

  const totalItems = computed(() => filteredItems.value.length);
  const totalPages = computed(() =>
    Math.ceil(totalItems.value / itemsPerPage.value),
  );

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredItems.value.slice(start, start + itemsPerPage.value);
  });

  // Reset page when search changes
  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    filteredItems,
    paginatedItems,
    paginatedData: paginatedItems, // Alias for compatibility
  };
}

/**
 * Composable for custom filter with filter function
 */
export function useTableDataWithFilter<T>(
  items: Ref<T[]>,
  searchQuery: Ref<string>,
  filterFn: (item: T, query: string) => boolean,
) {
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;
    return items.value.filter((item) => filterFn(item, searchQuery.value));
  });

  const totalItems = computed(() => filteredItems.value.length);
  const totalPages = computed(() =>
    Math.ceil(totalItems.value / itemsPerPage.value),
  );

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredItems.value.slice(start, start + itemsPerPage.value);
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    filteredItems,
    paginatedItems,
  };
}
