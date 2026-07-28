export const keys = {
  session: {
    all: ['session'] as const,
  },
  admin: {
    requests: {
      all: ['admin', 'requests'] as const,
      filtered: (status?: string) => ['admin', 'requests', status ?? 'PENDING'] as const,
    },
    stats: {
      all: ['admin', 'stats'] as const,
    },
    issuers: {
      all: ['admin', 'issuers'] as const,
      lists: () => [...keys.admin.issuers.all, 'list'] as const,
      list: (filters?: { status?: string; search?: string }) =>
        ['admin', 'issuers', 'list', filters?.status ?? 'ALL', filters?.search ?? ''] as const,
    },
    auditLog: {
      all: ['admin', 'audit-log'] as const,
      lists: () => [...keys.admin.auditLog.all, 'list'] as const,
      list: (filters?: { action?: string; actor?: string; from?: string; to?: string }) =>
        ['admin', 'audit-log', 'list', filters?.action ?? 'ALL', filters?.actor ?? '', filters?.from ?? '', filters?.to ?? ''] as const,
    },
  },
  issuer: {
    requestStatus: {
      all: ['issuer-request-status'] as const,
    },
    stats: {
      all: ['issuer', 'stats'] as const,
    },
    documents: {
      all: ['issuer', 'documents'] as const,
      list: (cursor?: string) => ['issuer', 'documents', cursor ?? ''] as const,
    },
    activity: {
      all: ['issuer', 'activity'] as const,
    },
  },
  document: {
    anchor: {
      detail: (hash: string) => ['document', 'anchor', hash] as const,
    },
    batch: {
      detail: (batchId: string) => ['document', 'batch', batchId] as const,
    },
  },
} as const
