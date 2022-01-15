import { copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param {{
 *   out?: string;
 * }} options
 */
export default function ({ out = 'build', assets = 'assets', serverFile = `${__dirname}/files/server.js` } = {}) {
  /** @type {import('@sveltejs/kit').Adapter} */
  const adapter = {
    name: '@robhicks/svelte-adapter-gun',

    async adapt({ utils }) {
      utils.log.minor(`Copying assets to ${assets}`);
      const staticDirectory = join(out, assets);
      utils.copy_client_files(staticDirectory);
      utils.copy_static_files(staticDirectory);

      utils.log.minor('Copying server');
      utils.copy_server_files(out);

      copyFileSync(serverFile, `${out}/index.js`);

      utils.log.minor('Prerendering static pages');
      await utils.prerender({
        dest: `${out}/prerendered`,
      });
    },
  };

  return adapter;
}
