/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
    dependencies: {},
    register(name, instance) {
        // TODO : shoudl throw on overwrite?
        console.log('register', name, instance);
        this.dependencies[name] = instance;
        console.log(this.dependencies)
    },
    get(name) {
        if (this.dependencies[name] === undefined) {
            // TODO : use COAError
            throw new Error('dependency not found:', name);
        }
        return this.dependencies[name]
    }
}
// exports.helperBuilder = helperBuilder;
