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
     * Archive all placements for a specific period
     */
    archivePeriode: async (periodeId: string) => {
      const { data } = await apiFetch<any>(
        "PlacementService",
        `/archive/archive-periode`,
        { method: "POST", data: { id_periode_pkl: periodeId } },
        true
      );
      return data;
    },

    /**
     * Get list of archived placements
     */
    getArchivedPlacements: async (params: {
      page: number;
      limit: number;
      id_periode_pkl?: string;
    }) => {
      const query = new URLSearchParams();
      if (params.page) query.append("page", String(params.page));
      if (params.limit) query.append("limit", String(params.limit));
      if (params.id_periode_pkl)
        query.append("id_periode_pkl", params.id_periode_pkl);
      
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
