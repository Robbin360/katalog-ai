interface SecurityEventContext {
  user_id?: string;
  shop?: string;
  ip?: string;
  user_agent?: string;
  [key: string]: unknown;
}

export function logSecurityEvent(
  event: string,
  ctx: SecurityEventContext = {}
) {
  const logEntry = {
    level: 'security',
    event,
    ts: new Date().toISOString(),
    ...ctx,
  };
  console.log(JSON.stringify(logEntry));
}

export const SecurityEvents = {
  OAUTH_HMAC_FAILED: 'oauth.hmac_failed',
  OAUTH_STATE_MISMATCH: 'oauth.state_mismatch',
  OAUTH_STALE_CALLBACK: 'oauth.stale_callback',
  OAUTH_TOKEN_EXCHANGE_FAILED: 'oauth.token_exchange_failed',
  OAUTH_SHOP_ALREADY_CONNECTED: 'oauth.shop_already_connected',
  OAUTH_MISSING_SCOPES: 'oauth.missing_scopes',
  WEBHOOK_HMAC_FAILED: 'webhook.hmac_failed',
  WEBHOOK_UNEXPECTED_TOPIC: 'webhook.unexpected_topic',
  WEBHOOK_DB_FAILED: 'webhook.db_failed',
  WEBHOOK_PROCESSED: 'webhook.processed',
  WEBHOOK_FAILED: 'webhook.failed',
  INTEGRATION_REVOKED: 'integration.revoked',
  INTEGRATION_REVOKE_FAILED: 'integration.revoke_failed',
  GDPR_DATA_REQUEST: 'gdpr.data_request',
  GDPR_REDACT: 'gdpr.redact',
  GDPR_REDACT_FAILED: 'gdpr.redact_failed',
  ACCOUNT_DELETED: 'account.deleted',
  ACCOUNT_DELETE_FAILED: 'account.delete_failed',
} as const;
