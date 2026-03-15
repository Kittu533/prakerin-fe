export const useArchiveApi = () => {
  const { $api } = useNuxtApp();

  return {
    /**
     * Archive all placements for a specific academic year
     */
    archiveYear: async (tahunAjaranId: string) => {
      return await $api.post('/archive/archive-year', { tahun_ajaran_id: tahunAjaranId });
    },

    /**
     * Get list of archived placements
     */
    getArchivedPlacements: async (params: { page: number; limit: number }) => {
      return await $api.get('/archive/placements', { params });
    }
  };
};
