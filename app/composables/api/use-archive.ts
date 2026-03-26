import { apiFetch } from "~/composables/api-fetch";

export const useArchiveApi = () => {
  return {
    /**
     * Archive all placements for a specific academic year
     */
    archiveYear: async (tahunAjaranId: string) => {
      const { data } = await apiFetch<any>(
        "PlacementService",
        `/archive/archive-year`,
        { method: "POST", data: { tahun_ajaran_id: tahunAjaranId } },
        true
      );
      return data;
    },

    /**
     * Get list of archived placements
     */
    getArchivedPlacements: async (params: { page: number; limit: number }) => {
      const query = new URLSearchParams();
      if (params.page) query.append("page", String(params.page));
      if (params.limit) query.append("limit", String(params.limit));
      
      const { data } = await apiFetch<any>(
        "PlacementService",
        `/archive/placements?${query.toString()}`,
        { method: "GET" },
        true
      );
      return data;
    }
  };
};
