import sqlite3 from 'sqlite3';
import {DEFAULT_TAMILMV_URL} from './config.js';
import fs from 'node:fs';
import path from 'node:path';
import {v4 as uuidv4} from 'uuid';

let db;

export function connectDatabase(dbPath = './database/manager.db') {
	fs.mkdirSync(path.dirname(dbPath), {recursive: true});

	return new Promise((resolve, reject) => {
		db = new sqlite3.Database(dbPath, error => {
			if (error) {
				reject(error);
			} else {
				resolve(db);
			}
		});
	});
}

export function initializeDatabaseSchema() {
	return new Promise((resolve, reject) => {
		db.run(
			'CREATE TABLE IF NOT EXISTS config (tamilmv_url TEXT, custom_search INT, custom_search_keyword TEXT, api_token TEXT)',
			async error => {
				if (error) {
					console.error('Schema creation error:', error.message);
					return reject(error);
				}

				// Attempt to add api_token column if it doesn't exist (for migration)
				db.run('ALTER TABLE config ADD COLUMN api_token TEXT', async () => {
					// We don't catch the error because it will fail if the column already exists
					try {
						const count = await getCount();
						if (count === 0) {
							await insertDefaultConfig(DEFAULT_TAMILMV_URL);
						} else {
							// For existing records without api_token, generate one
							const config = await getConfig();
							if (config && !config.api_token) {
								await updateConfig({
									...config,
									apiToken: uuidv4(),
								});
							}
						}

						resolve(true);
					} catch (error_) {
						reject(error_);
					}
				});
			},
		);
	});
}

function getCount() {
	return new Promise((resolve, reject) => {
		db.get('SELECT COUNT(*) AS count FROM config', (error, row) => {
			if (error) {
				reject(error);
			} else {
				resolve(row ? row.count : 0);
			}
		});
	});
}

function insertDefaultConfig(defaultUrl) {
	return new Promise((resolve, reject) => {
		const stmt = db.prepare('INSERT INTO config VALUES (?, ?, ?, ?)');
		stmt.run(defaultUrl, 0, 'movie', uuidv4(), error => {
			if (error) {
				reject(error);
			} else {
				resolve(true);
			}
		});
	});
}

export function getConfig() {
	return new Promise((resolve, reject) => {
		db.get('SELECT * FROM config', (error, row) => {
			if (error) {
				reject(error);
			} else {
				resolve(row ? {
					...row,
					tamilMvUrl: row.tamilmv_url,
					apiToken: row.api_token,
				} : null);
			}
		});
	});
}

export function updateConfig({tamilmvUrl, customSearch, customSearchKeyword, apiToken}) {
	return new Promise((resolve, reject) => {
		db.run(
			'UPDATE config SET tamilmv_url=?, custom_search=?, custom_search_keyword=?, api_token=?',
			[tamilmvUrl, customSearch ? 1 : 0, customSearchKeyword, apiToken],
			error => {
				if (error) {
					reject(error);
				} else {
					resolve(true);
				}
			},
		);
	});
}

export function updateRedirectUrl(tamilMvUrl) {
	return new Promise((resolve, reject) => {
		db.run('UPDATE config SET tamilmv_url=?', [tamilMvUrl], error => {
			if (error) {
				reject(error);
			} else {
				console.log(`[SUCCESS] Updated URL to ${tamilMvUrl}`);
				resolve(true);
			}
		});
	});
}

export function closeDatabase() {
	return new Promise((resolve, reject) => {
		if (db) {
			db.close(error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		} else {
			resolve();
		}
	});
}
