import { CreateLabInput } from '../providers/lab-provider.interface';

export class ResourcePolicyValidator {
  static validate(input: CreateLabInput): void {
    if (input.cpuLimit < 1 || input.cpuLimit > 8) {
      throw new Error('INVALID_RESOURCE_LIMIT: CPU limit must be between 1 and 8');
    }
    if (input.memoryLimit < 128 || input.memoryLimit > 16384) {
      throw new Error('INVALID_RESOURCE_LIMIT: Memory limit must be between 128MB and 16GB');
    }
    if (input.storageLimit < 1 || input.storageLimit > 100) {
      throw new Error('INVALID_RESOURCE_LIMIT: Storage limit must be between 1GB and 100GB');
    }
    if (input.timeoutMinutes < 5 || input.timeoutMinutes > 480) {
      throw new Error('INVALID_RESOURCE_LIMIT: Timeout must be between 5 and 480 minutes');
    }
    
    // Strict safety checks against arbitrary execution
    if (!input.image || input.image.includes('..') || input.image.startsWith('/')) {
      throw new Error('UNSAFE_IMAGE_CONFIGURATION');
    }
  }
}
