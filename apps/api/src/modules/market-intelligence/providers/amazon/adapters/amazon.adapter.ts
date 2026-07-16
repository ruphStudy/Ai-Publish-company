import * as https from 'https';
import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';

import { AmazonProviderConfig } from '../config/amazon-provider.config';
import {
  AmazonSearchItemsRequest,
  AmazonGetItemsRequest,
  AmazonSearchItemsResponse,
  AmazonGetItemsResponse,
} from '../interfaces/amazon.interface';
import {
  AMAZON_PAAPI_SERVICE,
  AMAZON_PAAPI_SEARCH_ITEMS_PATH,
  AMAZON_PAAPI_GET_ITEMS_PATH,
  AMAZON_PAAPI_CONTENT_TYPE,
  AMAZON_PAAPI_CONTENT_ENCODING,
  AMAZON_OPERATION_TARGETS,
} from '../constants/amazon.constants';
import { AmazonProviderExceptionHandler } from '../errors/amazon-error.handler';
import { IAmazonProviderAdapter } from './amazon-provider-adapter.interface';

@Injectable()
export class AmazonProviderAdapter implements IAmazonProviderAdapter {
  private readonly logger = new Logger(AmazonProviderAdapter.name);

  async searchItems(
    request: AmazonSearchItemsRequest,
    config: AmazonProviderConfig,
    timeoutMs: number,
  ): Promise<AmazonSearchItemsResponse> {
    const body = JSON.stringify(request);
    const headers = this.signRequest(
      AMAZON_PAAPI_SEARCH_ITEMS_PATH,
      body,
      config.host,
      config.region,
      config.accessKey,
      config.secretKey,
      AMAZON_OPERATION_TARGETS.SEARCH_ITEMS,
    );

    this.logger.debug('Executing Amazon SearchItems request', {
      keywords: request.Keywords,
      browseNodeId: request.BrowseNodeId,
      sortBy: request.SortBy,
    });

    return this.makeRequest<AmazonSearchItemsResponse>(
      config.host,
      AMAZON_PAAPI_SEARCH_ITEMS_PATH,
      body,
      headers,
      timeoutMs,
    );
  }

  async getItems(
    request: AmazonGetItemsRequest,
    config: AmazonProviderConfig,
    timeoutMs: number,
  ): Promise<AmazonGetItemsResponse> {
    const body = JSON.stringify(request);
    const headers = this.signRequest(
      AMAZON_PAAPI_GET_ITEMS_PATH,
      body,
      config.host,
      config.region,
      config.accessKey,
      config.secretKey,
      AMAZON_OPERATION_TARGETS.GET_ITEMS,
    );

    this.logger.debug('Executing Amazon GetItems request', {
      itemIds: request.ItemIds,
    });

    return this.makeRequest<AmazonGetItemsResponse>(
      config.host,
      AMAZON_PAAPI_GET_ITEMS_PATH,
      body,
      headers,
      timeoutMs,
    );
  }

  private signRequest(
    path: string,
    body: string,
    host: string,
    region: string,
    accessKey: string,
    secretKey: string,
    operationTarget: string,
  ): Record<string, string> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);

    const payloadHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');

    const canonicalHeaders = [
      `content-encoding:${AMAZON_PAAPI_CONTENT_ENCODING}`,
      `content-type:${AMAZON_PAAPI_CONTENT_TYPE}`,
      `host:${host}`,
      `x-amz-date:${amzDate}`,
      `x-amz-target:${operationTarget}`,
    ].join('\n') + '\n';

    const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

    const canonicalRequest = [
      'POST',
      path,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/${AMAZON_PAAPI_SERVICE}/aws4_request`;
    const canonicalRequestHash = crypto
      .createHash('sha256')
      .update(canonicalRequest, 'utf8')
      .digest('hex');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    const kDate = crypto
      .createHmac('sha256', `AWS4${secretKey}`)
      .update(dateStamp, 'utf8')
      .digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region, 'utf8').digest();
    const kService = crypto
      .createHmac('sha256', kRegion)
      .update(AMAZON_PAAPI_SERVICE, 'utf8')
      .digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request', 'utf8').digest();

    const signature = crypto
      .createHmac('sha256', kSigning)
      .update(stringToSign, 'utf8')
      .digest('hex');

    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      'Content-Encoding': AMAZON_PAAPI_CONTENT_ENCODING,
      'Content-Type': AMAZON_PAAPI_CONTENT_TYPE,
      Host: host,
      'X-Amz-Date': amzDate,
      'X-Amz-Target': operationTarget,
      Authorization: authorization,
    };
  }

  private makeRequest<T>(
    host: string,
    path: string,
    body: string,
    headers: Record<string, string>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const bodyBuffer = Buffer.from(body, 'utf8');

      const options: https.RequestOptions = {
        hostname: host,
        path,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': bodyBuffer.length,
        },
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => chunks.push(chunk));

        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');

          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            return reject(
              new Error(`Failed to parse Amazon PA-API response: ${raw.slice(0, 200)}`),
            );
          }

          if (res.statusCode && res.statusCode >= 400) {
            const err = Object.assign(new Error(`Amazon PA-API HTTP ${res.statusCode}`), {
              statusCode: res.statusCode,
              responseBody: parsed,
            });
            return reject(err);
          }

          resolve(parsed as T);
        });

        res.on('error', reject);
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        reject(
          Object.assign(new Error(`Amazon PA-API request timed out after ${timeoutMs}ms`), {
            code: 'PROVIDER_TIMEOUT',
          }),
        );
      });

      req.on('error', (err) => {
        this.logger.error('Amazon PA-API network error', { message: err.message });
        reject(err);
      });

      req.write(bodyBuffer);
      req.end();
    });
  }
}
