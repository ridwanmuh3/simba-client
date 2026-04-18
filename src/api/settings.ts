import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { ApiResponse } from "@/types/response";

export type CompanyProfile = {
  companyName: string;
  companyAddress: string;
  companyContact: string;
  bankAccount: string;
};

export type DocumentSequence = {
  nextInvoiceNo: string;
  nextQuotationNo: string;
};

export const useGetCompanyProfile = () => {
  return useQuery({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      const response =
        await axiosInstance.get<ApiResponse<CompanyProfile>>(
          "/settings/company",
        );

      if (response.data?.data && !response.data.data.bankAccount) {
        response.data.data.bankAccount =
          "BNI 2048441550 A.N Koperasi Konsumen Dewa Makmur Multi Sejahtera";
      }

      return response.data;
    },
  });
};

export const useUpdateCompanyProfile = () => {
  return useMutation({
    mutationFn: async (data: CompanyProfile) => {
      const response = await axiosInstance.put<ApiResponse<CompanyProfile>>(
        "/settings/company",
        data,
      );
      return response.data;
    },
  });
};

export const useGetNextDocumentNumbers = () => {
  return useQuery({
    queryKey: ["documentSequence"],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<DocumentSequence>>(
        "/settings/next-document-number",
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};
