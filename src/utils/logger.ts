import * as core from '@actions/core';

export class Logger {
  info(message: string): void {
    core.info(`[INFO] ${message}`);
  }

  warning(message: string): void {
    core.warning(`[WARNING] ${message}`);
  }

  error(message: string): void {
    core.error(`[ERROR] ${message}`);
  }

  debug(message: string): void {
    core.debug(`[DEBUG] ${message}`);
  }

  notice(message: string): void {
    core.notice(`[NOTICE] ${message}`);
  }

  group(name: string): void {
    core.startGroup(name);
  }

  endGroup(): void {
    core.endGroup();
  }
}
