import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Exposes the environment variables that have been defined
 * within the optional dotenv (.env) file within the running working directory.
 *
 * Harbor will define these environment variables and will fall back
 * to the default values when missing.
 */
class Environment {
  constructor() {
    this.defaults = {
      THEME_SRC: './src',
      THEME_DIST: './dist',
      THEME_PORT: 8080,
      THEME_DEBUG: false,
      THEME_ENVIRONMENT: 'production',
      THEME_WEBSOCKET_PORT: 35729,
    };

    this.config = {};
  }

  /**
   * Loads the environment configuration from the optional environment file.
   */
  define() {
    const source = path.resolve(process.cwd(), '.env');
    const env = fs.existsSync(source) ? dotenv.config({ path: source }) : {};

    if (env.error) {
      throw env.error;
    }

    const parsed = env.parsed || {};

    // Inherit any missing option from the defaults Object.
    Object.keys(this.defaults).forEach((defaultOption) => {
      if (!Object.prototype.hasOwnProperty.call(parsed, defaultOption)) {
        parsed[defaultOption] = parseInt(this.defaults[defaultOption], 10)
          ? parseInt(this.defaults[defaultOption], 10)
          : this.defaults[defaultOption];
      }

      if (
        typeof parsed[defaultOption] === 'string' &&
        ['false', '0'].includes(parsed[defaultOption].toLowerCase())
      ) {
        parsed[defaultOption] = false;
      }

      if (
        typeof parsed[defaultOption] === 'string' &&
        ['true', '1'].includes(parsed[defaultOption].toLowerCase())
      ) {
        parsed[defaultOption] = true;
      }
    });

    this.config = parsed;

    return parsed;
  }

  /**
   * Checks if the defined environment build destination is empty.
   *
   * @param {Object} environment The environment configuration to use.
   */
  static hasBuild(environment) {
    if (!environment || !environment.THEME_DIST) {
      return false;
    }

    if (!fs.existsSync(path.resolve(environment.THEME_DIST))) {
      return false;
    }

    return fs.readdirSync(path.resolve(environment.THEME_DIST)).length > 0;
  }
}

export default Environment;
