import rimraf from 'rimraf';
import fs from 'fs';
import path from 'path';

import Worker from './Worker.js';

/**
 * Clears the defined environment destination directory.
 */
export default class Cleaner extends Worker {
  constructor(services) {
    super(services);
  }

  /**
   * The initial handler that will be called by the Harbor TaskManager.
   */
  async init() {
    if (this.environment) {
      this.path = path.resolve(this.environment.THEME_DIST);

      if (fs.existsSync(this.path)) {
        this.Console.info(`Cleaning directory: ${this.path}`);

        rimraf(this.path, () => {
          this.Console.success(`Directory cleaned: ${this.path}`);

          super.resolve();
        });
      } else {
        this.Console.warning(`${this.path} does not exist and will not be cleared.`);

        super.resolve();
      }
    }
  }
}
