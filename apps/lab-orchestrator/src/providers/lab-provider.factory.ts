import { Provider } from '@nestjs/common';
import { MockProvider } from './mock.provider';
import { DockerProvider } from './docker.provider';
import { ILabProvider } from './ilab.provider';

export const LAB_PROVIDER_TOKEN = 'ILAB_PROVIDER';

export const LabProviderFactory: Provider = {
  provide: LAB_PROVIDER_TOKEN,
  useFactory: () => {
    const providerType = process.env.LAB_PROVIDER || 'mock';
    if (providerType === 'docker') {
      return new DockerProvider();
    }
    return new MockProvider();
  },
};
