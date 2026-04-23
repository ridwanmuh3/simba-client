export const queryKeys = {
  auth: {
    current: ["authUser"] as const,
  },
  dashboard: {
    stats: ["dashboard-stats"] as const,
  },
  items: {
    all: ["items-stock"] as const,
    list: (search: string, page: number, limit: number) =>
      ["items-stock", search, page, limit] as const,
    listWithFilters: (
      search: string,
      page: number,
      limit: number,
      dateFrom?: Date,
      dateTo?: Date,
      type?: string,
    ) => ["items-stock", search, page, limit, dateFrom, dateTo, type] as const,
    full: ["items-stock-mapping"] as const,
    stocksSummary: (
      search: string,
      page: number,
      limit: number,
      dateFrom?: Date,
      dateTo?: Date,
    ) =>
      [
        "items-stocks-summary",
        search,
        page,
        limit,
        dateFrom?.toISOString(),
        dateTo?.toISOString(),
      ] as const,
    financeSummary: ["stocks-finance-summary"] as const,
    invoiceHistory: (
      search: string,
      page: number,
      limit: number,
      dateFrom?: Date,
      dateTo?: Date,
    ) =>
      [
        "invoice-history",
        search,
        page,
        limit,
        dateFrom?.toISOString(),
        dateTo?.toISOString(),
      ] as const,
  },
  finance: {
    all: ["finances"] as const,
    list: (
      search: string,
      page: number,
      limit: number,
      startDate?: string,
      endDate?: string,
    ) => ["finances", { search, page, limit, startDate, endDate }] as const,
    report: ["finances-report"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (page: number, limit: number) => ["users", page, limit] as const,
    stats: ["users_stats"] as const,
  },
} as const;
