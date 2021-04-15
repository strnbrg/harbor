const { join } = require('path');
const minify = require('minify');
const { sync } = require('glob');
const { writeFile, write, existsSync, statSync } = require('fs');

const BaseService = require('./BaseService');
const { exception } = require('console');

class JsOptimizer extends BaseService {
  constructor(tooling, options) {
    super(tooling, options);
  }

  async init() {
    super.init();

    if (!this.config.entry instanceof Object) {
      return;
    }

    const entries = Object.keys(this.config.entry);

    if (!entries.length) {
      return;
    }

    await Promise.all(
      entries.map(
        (name) =>
          new Promise((cb) => {
            const cwd = sync(join(this.environment.THEME_DIST, this.config.entry[name]));

            this.optimizeCwd(cwd).then((data) => cb());
          })
      )
    );

    super.resolve();
  }

  async optimizeCwd(cwd) {
    await Promise.all(
      cwd.map(
        (path) =>
          new Promise((done) => {
            if (!existsSync(path) || !statSync(path).size) {
              return done();
            }

            this.Console.log(`Optimizing: ${path}`);

            minify(path, this.config.options || {})
              .then((data) =>
                this.optimizeFile(path, data)
                  .then(() => done())
                  .catch((exception) => this.Console.error(exception))
              )
              .catch((exception) => this.Console.error(exception));
          })
      )
    );
  }

  optimizeFile(path, blob) {
    if (!path) {
      return this.Console.error(`Unable to optimize script, no path has been defined.`);
    }

    if (!blob) {
      return this.Console.error(`Unable to optimize script, no data has been defined for ${path}.`);
    }

    return new Promise((cb) => {
      writeFile(path, blob, () => {
        this.Console.log(`File optimized: ${path}`);

        cb();
      });
    });
  }
}

module.exports = JsOptimizer;
