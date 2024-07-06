class RequestBody {
    #_data: Record<string, any> = {}

    /**
     * Securely set key:value pair
     * @param name 
     * @param value 
     */
    set(name: string, value: any) {
        if (typeof name !== 'string') { throw new TypeError(`The property name can only be a string, instead got ${typeof name}`) }
        if (!(name === '__proto__' || name === 'constructor' || name === 'prototype')) {
            this.#_data[name] = value;
        }
    }

    /**
     * Get the value
     * @param name 
     * @returns {any}
     */
    get(name: string) {
        return this.#_data[name]
    }

    _toJSON() {
        return this.#_data;
    }

    /**
     * Safely copy an object
     * @param value 
     */
    from(value: any) {
        if (typeof value === 'object' && Object.keys(value).length > 0) {
            for (const prop in value) {
                this.set(prop, value[prop])
            }
        }

        return this._toJSON();
    }
}

export default RequestBody;