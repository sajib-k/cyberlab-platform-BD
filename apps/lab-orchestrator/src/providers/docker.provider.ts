import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';
import { ILabProvider, LabInstanceConfig, LabStatus, ConnectionInfo } from './ilab.provider';

@Injectable()
export class DockerProvider implements ILabProvider {
  private readonly logger = new Logger(DockerProvider.name);
  private docker: Docker;
  private networkName: string;
  private allowedImages: string[];

  constructor() {
    this.docker = new Docker();
    this.networkName = process.env.LAB_DOCKER_NETWORK || 'cyberlab-labs';
    
    const allowedImagesEnv = process.env.LAB_ALLOWED_IMAGES || 'cyberlab/labs/*,nginx:alpine';
    this.allowedImages = allowedImagesEnv.split(',').map((img) => img.trim());
  }

  private async ensureNetwork(): Promise<string> {
    try {
      const networks = await this.docker.listNetworks({
        filters: { name: [this.networkName] },
      });

      if (networks.length > 0) {
        return networks[0].Id;
      }

      const network = await this.docker.createNetwork({
        Name: this.networkName,
        Driver: 'bridge',
        Internal: true,
        Labels: {
          'cyberlab.managed': 'true',
          'cyberlab.network': this.networkName,
        },
      });

      this.logger.log(`Created isolated CyberLab network: ${this.networkName}`);
      return network.id;
    } catch (error) {
      this.logger.error(`Failed to ensure network: ${error.message}`);
      throw new Error('NETWORK_CREATE_FAILED');
    }
  }

  private isImageAllowed(image: string): boolean {
    return this.allowedImages.some((pattern) => {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return image.startsWith(prefix);
      }
      return image === pattern;
    });
  }

  async create(config: LabInstanceConfig): Promise<void> {
    if (!this.isImageAllowed(config.image)) {
      throw new Error(`IMAGE_NOT_ALLOWED: Image ${config.image} is not in the allowed list.`);
    }

    await this.ensureNetwork();
    const containerName = `cyberlab-lab-${config.labInstanceId}`;

    try {
      const existing = this.docker.getContainer(containerName);
      const data = await existing.inspect().catch(() => null);
      if (data) {
        this.logger.warn(`Container ${containerName} already exists. Skipping creation.`);
        return;
      }
    } catch {}

    try {
      await this.docker.createContainer({
        Image: config.image,
        name: containerName,
        Labels: {
          'cyberlab.managed': 'true',
          'cyberlab.labInstanceId': config.labInstanceId,
          'cyberlab.machineId': config.machineId,
          'cyberlab.templateId': config.templateId,
        },
        HostConfig: {
          Privileged: false,
          NetworkMode: this.networkName,
          PidMode: '',
          IpcMode: 'private',
          UTSMode: '',
          ReadonlyRootfs: false,
          AutoRemove: false,
          Binds: [],
          Devices: [],
          CapDrop: ['ALL'],
          CapAdd: ['NET_BIND_SERVICE'],
          NanoCPUs: Math.floor((config.cpuLimit || 1) * 1e9),
          Memory: config.memoryLimit || 512 * 1024 * 1024,
          PidsLimit: 256,
        },
        NetworkingConfig: {
          EndpointsConfig: {
            [this.networkName]: {},
          },
        },
      });

      this.logger.log(`Successfully created container: ${containerName}`);
    } catch (error) {
      this.logger.error(`Container creation failed: ${error.message}`);
      throw new Error('CONTAINER_CREATE_FAILED');
    }
  }

  async start(labInstanceId: string): Promise<void> {
    const containerName = `cyberlab-lab-${labInstanceId}`;
    try {
      const container = this.docker.getContainer(containerName);
      const data = await container.inspect();

      if (data.State.Running) {
        return;
      }

      await container.start();
      this.logger.log(`Started container: ${containerName}`);
    } catch (error) {
      this.logger.error(`Failed to start container ${containerName}: ${error.message}`);
      throw new Error('CONTAINER_START_FAILED');
    }
  }

  async stop(labInstanceId: string): Promise<void> {
    const containerName = `cyberlab-lab-${labInstanceId}`;
    try {
      const container = this.docker.getContainer(containerName);
      const data = await container.inspect().catch(() => null);

      if (!data || !data.State.Running) {
        return;
      }

      await container.stop({ t: 5 });
      this.logger.log(`Stopped container: ${containerName}`);
    } catch (error) {
      this.logger.error(`Failed to stop container ${containerName}: ${error.message}`);
      throw new Error('CONTAINER_STOP_FAILED');
    }
  }

  async restart(labInstanceId: string): Promise<void> {
    await this.stop(labInstanceId);
    await this.start(labInstanceId);
  }

  async destroy(labInstanceId: string): Promise<void> {
    const containerName = `cyberlab-lab-${labInstanceId}`;
    try {
      const container = this.docker.getContainer(containerName);
      const data = await container.inspect().catch(() => null);

      if (!data) {
        return;
      }

      if (data.State.Running) {
        await container.stop({ t: 2 }).catch(() => {});
      }

      await container.remove({ force: true });
      this.logger.log(`Destroyed container: ${containerName}`);
    } catch (error) {
      this.logger.error(`Failed to destroy container ${containerName}: ${error.message}`);
      throw new Error('CONTAINER_DESTROY_FAILED');
    }
  }

  async getStatus(labInstanceId: string): Promise<LabStatus> {
    const containerName = `cyberlab-lab-${labInstanceId}`;
    try {
      const container = this.docker.getContainer(containerName);
      const data = await container.inspect();

      if (data.State.Running) return LabStatus.RUNNING;
      if (data.State.Paused) return LabStatus.STOPPED;
      if (data.State.Exited) return LabStatus.STOPPED;
      return LabStatus.CREATED;
    } catch {
      return LabStatus.DESTROYED;
    }
  }

  async getConnectionInfo(labInstanceId: string): Promise<ConnectionInfo> {
    const containerName = `cyberlab-lab-${labInstanceId}`;
    try {
      const container = this.docker.getContainer(containerName);
      const data = await container.inspect();
      const networkSettings = data.NetworkSettings.Networks[this.networkName];

      return {
        containerId: data.Id,
        internalHostname: data.Config.Hostname,
        internalIP: networkSettings ? networkSettings.IPAddress : '',
        allowedPorts: [],
      };
    } catch {
      throw new Error('CONTAINER_NOT_FOUND');
    }
  }
}
