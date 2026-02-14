const fs = require('fs');
const path = require('path');

class LocalDB {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.filePath = path.join(__dirname, '..', `local_db_${collectionName}.json`);
        this.data = this.load();
    }

    load() {
        if (!fs.existsSync(this.filePath)) {
            return [];
        }
        try {
            return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        } catch (e) {
            return [];
        }
    }

    save() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    }

    find(query = {}) {
        const getResults = () => {
            return this.data.filter(item => {
                for (let key in query) {
                    // Simple equality check
                    if (item[key] != query[key]) return false;
                }
                return true;
            });
        };

        let limitValue = null;
        let selectFields = null;

        return {
            sort: (sortParams) => {
                let results = getResults();
                const sortKey = Object.keys(sortParams)[0];
                const order = sortParams[sortKey];

                results.sort((a, b) => {
                    if (a[sortKey] < b[sortKey]) return order === 1 ? -1 : 1;
                    if (a[sortKey] > b[sortKey]) return order === 1 ? 1 : -1;
                    return 0;
                });

                return {
                    limit: (n) => {
                        limitValue = n;
                        return {
                            select: (fields) => {
                                selectFields = fields;
                                return Promise.resolve(applyLimitAndSelect(results));
                            },
                            then: (resolve, reject) => {
                                return Promise.resolve(applyLimitAndSelect(results)).then(resolve, reject);
                            }
                        };
                    },
                    select: (fields) => {
                        selectFields = fields;
                        return Promise.resolve(applyLimitAndSelect(results));
                    },
                    then: (resolve, reject) => {
                        return Promise.resolve(applyLimitAndSelect(results)).then(resolve, reject);
                    }
                };
            },
            limit: (n) => {
                limitValue = n;
                return {
                    select: (fields) => {
                        selectFields = fields;
                        return Promise.resolve(applyLimitAndSelect(getResults()));
                    },
                    then: (resolve, reject) => {
                        return Promise.resolve(applyLimitAndSelect(getResults())).then(resolve, reject);
                    }
                };
            },
            select: (fields) => {
                selectFields = fields;
                return {
                    sort: (sortParams) => {
                        let results = getResults();
                        const sortKey = Object.keys(sortParams)[0];
                        const order = sortParams[sortKey];

                        results.sort((a, b) => {
                            if (a[sortKey] < b[sortKey]) return order === 1 ? -1 : 1;
                            if (a[sortKey] > b[sortKey]) return order === 1 ? 1 : -1;
                            return 0;
                        });

                        return Promise.resolve(applyLimitAndSelect(results));
                    },
                    then: (resolve, reject) => {
                        return Promise.resolve(applyLimitAndSelect(getResults())).then(resolve, reject);
                    }
                };
            },
            // Make it thenable so 'await Model.find()' works
            then: (resolve, reject) => {
                return Promise.resolve(applyLimitAndSelect(getResults())).then(resolve, reject);
            }
        };

        function applyLimitAndSelect(results) {
            if (limitValue) {
                results = results.slice(0, limitValue);
            }
            if (selectFields) {
                const fields = selectFields.split(' ');
                results = results.map(item => {
                    const filtered = {};
                    fields.forEach(field => {
                        if (item[field] !== undefined) {
                            filtered[field] = item[field];
                        }
                    });
                    return filtered;
                });
            }
            return results;
        }
    }

    findOne(query) {
        const item = this.data.find(item => {
            for (let key in query) {
                if (item[key] != query[key]) return false;
            }
            return true;
        });
        // Mimic Mongoose Document
        return Promise.resolve(item ? new ModelInstance(this, item) : null);
    }

    findById(id) {
        const item = this.data.find(item => item._id === id);
        return Promise.resolve(item ? new ModelInstance(this, item) : null);
    }

    async findByIdAndDelete(id) {
        const index = this.data.findIndex(item => item._id === id);
        if (index !== -1) {
            const item = this.data[index];
            this.data.splice(index, 1);
            this.save();
            return new ModelInstance(this, item);
        }
        return null;
    }

    async findOneAndDelete(query) {
        const index = this.data.findIndex(item => {
            for (let key in query) {
                if (item[key] != query[key]) return false;
            }
            return true;
        });

        if (index !== -1) {
            const item = this.data[index];
            this.data.splice(index, 1);
            this.save();
            return new ModelInstance(this, item);
        }
        return null;
    }

    async deleteMany(query) {
        const initialLength = this.data.length;
        this.data = this.data.filter(item => {
            for (let key in query) {
                if (item[key] == query[key]) return false;
            }
            return true;
        });
        this.save();
        return { deletedCount: initialLength - this.data.length };
    }
}

class ModelInstance {
    constructor(db, data) {
        this.db = db;
        Object.assign(this, data);
    }

    async save() {
        if (!this._id) {
            this._id = Math.random().toString(36).substr(2, 9);
            // created_at handler if missing
            if (!this.created_at) this.created_at = new Date();
            
            // Create a plain object without the db reference
            const plainData = {};
            for (let key in this) {
                if (key !== 'db' && this.hasOwnProperty(key)) {
                    plainData[key] = this[key];
                }
            }
            this.db.data.push(plainData);
        } else {
            const index = this.db.data.findIndex(i => i._id === this._id);
            if (index !== -1) {
                // Update with plain object
                const plainData = {};
                for (let key in this) {
                    if (key !== 'db' && this.hasOwnProperty(key)) {
                        plainData[key] = this[key];
                    }
                }
                this.db.data[index] = plainData;
            }
        }
        this.db.save();
        return this;
    }
}

// Factory function
const models = {};

const createModel = (name) => {
    if (models[name]) return models[name];

    const db = new LocalDB(name.toLowerCase());

    const Model = function (data) {
        return new ModelInstance(db, data);
    };

    Model.find = (query) => db.find(query);
    Model.findOne = (query) => db.findOne(query);
    Model.findById = (id) => db.findById(id);
    Model.findOneAndDelete = (query) => db.findOneAndDelete(query);
    Model.findByIdAndDelete = (id) => db.findByIdAndDelete(id);
    Model.deleteMany = (query) => db.deleteMany(query);

    models[name] = Model;
    return Model;
};

module.exports = createModel;
