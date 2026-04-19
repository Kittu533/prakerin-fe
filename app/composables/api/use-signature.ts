import { apiFetch } from "~/composables/api-fetch";

export interface DigitalSignature {
  id: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  timestamp: string;
  ipAddress?: string | null;
}

export interface DigitalSignatureVerified extends DigitalSignature {
  documentId: string;
  documentType: string;
  signatureHash: string;
  hashValid: boolean;
  isValid: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface GuruMasterSignature {
  id: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  signatureData: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
  isValid: boolean;
  hasImagePayload: boolean;
}

export interface GuruMasterSignatureBatchVerification {
  includeInactive: boolean;
  total: number;
  validCount: number;
  invalidCount: number;
  items: Array<{
    guruId: string;
    guruName: string;
    nip: string;
    isPenandatangan: boolean;
    hasSignature: boolean;
    signatureId?: string;
    updatedAt?: string;
    payloadType: "image-data-url" | "base64" | "text-qr" | "empty";
    isValid: boolean;
    message: string;
  }>;
}

interface SafeResult<T> {
  success: boolean;
  data?: T;
  message: string;
}

async function safeFetch<T>(
  endpoint: string,
  options: any = {},
  withToken: boolean = true,
): Promise<SafeResult<T>> {
  try {
    const response = await apiFetch<any>(
      "TataUsahaService",
      endpoint,
      options,
      withToken,
    );

    if (response.status >= 200 && response.status < 300) {
      const responseData = response.data;
      if (responseData && typeof responseData === "object") {
        return {
          success: true,
          data: (responseData.response ?? responseData.data ?? responseData) as T,
          message: responseData.message ?? "Success",
        };
      }
      return { success: true, data: undefined, message: "Success" };
    }

    return {
      success: false,
      data: undefined,
      message: response.data?.message ?? `HTTP ${response.status}`,
    };
  } catch (error: any) {
    console.error("[useSignature] request error:", error);
    return {
      success: false,
      data: undefined,
      message: error?.message || "Network error",
    };
  }
}

export function useSignatureApi() {
  async function createSignature(payload: {
    documentId: string;
    documentType: string;
    signatureData?: string;
    metadata?: Record<string, unknown>;
  }) {
    return safeFetch<DigitalSignature>("/signature", {
      method: "POST",
      data: {
        documentId: payload.documentId,
        documentType: payload.documentType,
        signatureData: payload.signatureData || "MANUAL_TU_SIGNATURE",
        metadata: payload.metadata,
      },
    });
  }

  async function getDocumentSignatures(documentId: string, documentType: string) {
    return safeFetch<DigitalSignature[]>(
      `/signature/document/${encodeURIComponent(documentId)}/${encodeURIComponent(documentType)}`,
      { method: "GET" },
    );
  }

  async function verifyDocumentSignatures(documentId: string, documentType: string) {
    return safeFetch<DigitalSignatureVerified[]>(
      `/signature/verify/${encodeURIComponent(documentId)}/${encodeURIComponent(documentType)}`,
      { method: "GET" },
      false,
    );
  }

  async function revokeSignature(signatureId: string) {
    return safeFetch<DigitalSignature>(`/signature/${encodeURIComponent(signatureId)}`, {
      method: "DELETE",
    });
  }

  async function saveGuruMasterSignature(
    guruId: string,
    payload: {
      signatureData: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return safeFetch<DigitalSignature>(
      `/signature/guru/${encodeURIComponent(guruId)}/master`,
      {
        method: "POST",
        data: {
          signatureData: payload.signatureData,
          metadata: payload.metadata,
        },
      },
    );
  }

  async function getLatestGuruMasterSignature(guruId: string) {
    return safeFetch<GuruMasterSignature | null>(
      `/signature/guru/${encodeURIComponent(guruId)}/latest`,
      { method: "GET" },
    );
  }

  async function resetGuruMasterSignature(guruId: string) {
    return safeFetch<{ guruId: string; guruName: string; revokedCount: number }>(
      `/signature/guru/${encodeURIComponent(guruId)}/master`,
      { method: "DELETE" },
    );
  }

  async function verifyGuruMasterSignatureBatch(params?: { includeInactive?: boolean }) {
    const query = new URLSearchParams();
    if (typeof params?.includeInactive === "boolean") {
      query.append("includeInactive", String(params.includeInactive));
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return safeFetch<GuruMasterSignatureBatchVerification>(
      `/signature/guru/verify-batch${suffix}`,
      { method: "GET" },
    );
  }

  return {
    createSignature,
    getDocumentSignatures,
    verifyDocumentSignatures,
    revokeSignature,
    saveGuruMasterSignature,
    getLatestGuruMasterSignature,
    resetGuruMasterSignature,
    verifyGuruMasterSignatureBatch,
  };
}
