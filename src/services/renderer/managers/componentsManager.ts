import fs from 'fs';
import path from 'path';
import helpers from "../../../utils/helpers";
import Component from "../assets/Component";

class ComponentsManager {
    readonly #_storage: Record<string, Component> = {};
    readonly #_registers: Promise<void>[] = [];

    readonly #_helpers = {
        create: (component: Component) => {
            this.#_storage[component.name] = component;
        },
        register: async (directory: string) => {
            try {
                const dirents = await fs.promises.readdir(directory, { encoding: 'utf-8', withFileTypes: true });

                const files = dirents.filter(i => i.isFile() && (i.name.toLowerCase().endsWith('.comp.js') || i.name.toLowerCase().endsWith('.component.js')));
                const folders = dirents.filter(i => !i.isFile());

                for (const file of files) {
                    const content = await helpers.loadFileModule(path.join(file.parentPath, file.name));
                    if (!(content instanceof Component)) { continue }
                    const compName = content.name;
                    if (compName in this.#_storage) { throw new Error(`${compName} is already defined. Only unique Component names are allowed`) }
                    this.#_helpers.create(content);
                }

                for (const folder of folders) {
                    if (folder.name !== 'locals') {
                        await this.#_helpers.register(path.join(directory, folder.name));
                    }
                }
            } catch (error) {
                if (error instanceof Error) { error.message = `Unable to register components from directory (${directory}): ${error.message}` }
                throw error
            }
        }
    }

    /**
     * Register your defined components so you can use them in your code
     * @param paths A `PathLike` or an array of `PathLike` directories containing your components. 
     */
    register(paths: string | string[]) {
        if (!Array.isArray(paths)) { paths = [paths] }
        const errRes = { message: 'Invalid components\' paths detected. Read the error list', errors: [] as any[], paths }

        // Validating input
        for (const viewsPath of paths) {
            const validity = helpers.checkPathAccessibility(viewsPath);
            if (validity.valid) {
                this.#_registers.push(this.#_helpers.register(viewsPath));
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

    /**Run all the stored registers */
    async scan(): Promise<void> {
        if (this.#_registers.length > 0) {
            helpers.printConsole('Scanning for components...');
            await Promise.allSettled(this.#_registers);
            this.#_registers.length = 0;
        }
    }

    /**Get all the components in an array */
    get all() { return Object.values(this.#_storage) }
    /**Access the storage object */
    get storage() { return this.#_storage }
}

export default new ComponentsManager();