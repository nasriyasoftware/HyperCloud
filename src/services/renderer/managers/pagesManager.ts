import fs from 'fs';
import path from 'path';
import helpers from "../../../utils/helpers";
import Page from "../assets/Page";

class PagesManager {
    #_storage: Record<string, Page> = {};

    #_helpers = {
        create: (page: Page) => {            
            this.#_storage[page.name] = page;
        },
        register: async (directory: string) => {
            const dirents = fs.readdirSync(directory, { encoding: 'utf-8', withFileTypes: true });

            const files = dirents.filter(i => i.isFile() && i.name.toLowerCase().endsWith('.page.js'));
            const folders = dirents.filter(i => !i.isFile());

            for (const file of files) {
                const content = await helpers.loadModule(path.join(file.parentPath, file.name));
                if (!(content instanceof Page)) { continue }
                const pageName = content.name;
                if (pageName in this.#_storage) { throw new Error(`${pageName} is already defined. Only unique Page names are allowed`) }
                this.#_helpers.create(content);
            }

            for (const folder of folders) {
                if (folder.name !== 'locals') {
                    this.#_helpers.register(path.join(directory, folder.name));
                }
            }
        }
    }

    /**
     * Register your defined pages so you can use them in your code
     * @param paths A `PathLike` or an array of `PathLike` directories containing your pages. 
     */
    async register(paths: string | string[]) {        
        if (!Array.isArray(paths)) { paths = [paths] }
        const errRes = { message: 'Invalid pages\' paths detected. Read the error list', errors: [] as any[] }

        // Validating input
        for (const viewsPath of paths) {
            const validity = helpers.checkPathAccessibility(viewsPath);
            if (validity.valid) {
                await this.#_helpers.register(viewsPath);
                continue;
            }

            const error = { path: viewsPath, type: 'invalid_path', error: '' }
            if (validity.errors.notString) { error.error = 'Not a string' }
            if (validity.errors.doesntExist) { error.error = 'Path doesn\'t exist' }
            if (validity.errors.notAccessible) { error.error = 'access denied: no read permissions' }
            errRes.errors.push(error);
        }

        if (errRes.errors.length > 0) { throw errRes }
    }

    /**Get all the pages in an array */
    get all() { return Object.values(this.#_storage) }
    /**Access the storage object */
    get storage() { return this.#_storage }
}

export default new PagesManager();