import { Injectable } from '@nestjs/common';

@Injectable()
export class MachineTemplateValidationService {
  private readonly allowedRegistries = ['cyberlab/', 'library/', 'ubuntu/', 'alpine/'];

  validateTemplateForProvisioning(template: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // ১. কন্টেইনার ইমেজ হোয়াইটলিস্ট চেক
    const hasValidRegistry = this.allowedRegistries.some(reg => template.image.startsWith(reg));
    if (!hasValidRegistry) {
      errors.push(`Container image registry is not allowed: ${template.image}`);
    }

    // ২. ইমেজ ট্যাগ ইনজেকশন প্রোটেকশন চেক
    const safeTagRegex = /^[a-zA-Z0-9_.-]+$/;
    if (template.imageTag && !safeTagRegex.test(template.imageTag)) {
      errors.push('Image tag contains forbidden characters or potential injection syntax');
    }

    // ৩. রিসোর্স সিলিং বাউন্ডারি চেক
    if (template.cpuLimit <= 0 || template.cpuLimit > 8) {
      errors.push('CPU limit exceeds allowed infrastructure boundaries (1-8)');
    }
    if (template.memoryLimit < 128 || template.memoryLimit > 16384) {
      errors.push('Memory limit out of permitted range (128MB - 16GB)');
    }

    // ৪. স্ট্যাটাস চেক
    if (template.status !== 'READY') {
      errors.push('Template is not in READY status for lab provisioning');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
