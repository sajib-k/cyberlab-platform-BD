import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class LabOrchestratorClient {
  private orchestratorUrl = process.env.LAB_ORCHESTRATOR_URL || 'http://localhost:5000';
  private orchestratorToken = process.env.LAB_ORCHESTRATOR_TOKEN || 'secure-internal-orchestrator-token-change-me';

  async createLabInstance(payload: any, correlationId?: string) {
    return this.request('/internal/lab-instances', 'POST', payload, correlationId);
  }

  async startLabInstance(instanceId: string, correlationId?: string) {
    return this.request(`/internal/lab-instances/${instanceId}/start`, 'POST', {}, correlationId);
  }

  async stopLabInstance(instanceId: string, correlationId?: string) {
    return this.request(`/internal/lab-instances/${instanceId}/stop`, 'POST', {}, correlationId);
  }

  async getLabStatus(instanceId: string, correlationId?: string) {
    return this.request(`/internal/lab-instances/${instanceId}/status`, 'GET', null, correlationId);
  }

  async destroyLabInstance(instanceId: string, correlationId?: string) {
    return this.request(`/internal/lab-instances/${instanceId}`, 'DELETE', null, correlationId);
  }

  private async request(endpoint: string, method: string, data?: any, correlationId?: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.orchestratorToken}`,
      };

      if (correlationId) {
        headers['X-Correlation-ID'] = correlationId;
      }

      const response = await fetch(`${this.orchestratorUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new HttpException(`Orchestrator error: ${errText}`, HttpStatus.BAD_GATEWAY);
      }

      if (response.status === 204) {
        return { success: true };
      }

      return await response.json();
    } catch (error: any) {
      throw new HttpException(
        `Failed to communicate with Lab Orchestrator: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
