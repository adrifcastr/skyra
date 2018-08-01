const { util } = require('klasa');
const SORT = (x, y) => +(y.count > x.count) || +(x.count === y.count) - 1;

/**
 * The MemberConfiguration class that manages per-member configs
 * @since 1.6.0
 * @version 5.0.0
 */
class MemberConfiguration {

	/**
	 * @typedef  {Object} MemberConfigurationJSON
	 * @property {number} count
	 * @property {string} guild
	 * @property {string} member
	 */

	/**
	 * Create a new instance of MemberConfiguration given a GuildMember instance
	 * @since 3.0.0
	 * @param {SkyraGuildMember} member A GuildMember instance
	 */
	constructor(member) {
		Object.defineProperties(this, {
			client: { writable: true },
			guildID: { writable: true },
			userID: { writable: true },
			UUID: { writable: true },
			_syncStatus: { writable: true }
		});

		/**
		 * The client this MemberConfiguration was created with.
		 * @since 3.0.0
		 * @type {Skyra}
		 * @readonly
		 */
		this.client = member.client;

		/**
		 * The guild id where the member belongs to.
		 * @since 3.0.0
		 * @type {string}
		 * @readonly
		 */
		this.guildID = member.guild.id;

		/**
		 * The member id.
		 * @since 3.0.0
		 * @type {string}
		 * @readonly
		 */
		this.userID = member.id;

		/**
		 * The amount of points
		 * @since 3.0.0
		 * @type {number}
		 */
		this.count = 0;

		/**
		 * The UUID for this entry.
		 * @since 3.0.0
		 * @type {boolean}
		 * @private
		 */
		this.UUID = null;

		/**
		 * The promise sync status, if syncing.
		 * @since 3.0.0
		 * @type {?Promise<this>}
		 * @private
		 */
		this._syncStatus = null;

		// Sync the configs
		this.sync();
	}

	/**
	 * Get the member
	 * @since 3.0.0
	 * @returns {GuildMember}
	 * @readonly
	 */
	get member() {
		return this.client.guilds.get(this.guildID).members.get(this.userID);
	}

	/**
	 * Synchronize the MemberConfiguration instance with the database
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 */
	sync() {
		if (!this.client._skyraReady) return Promise.resolve(this);
		if (!this._syncStatus) this._syncStatus = this._sync();
		return this._syncStatus;
	}

	/**
	 * Update the member instance
	 * @since 3.0.0
	 * @param {number} amount The amount of points to increase
	 * @returns {Promise<this>}
	 */
	async update(amount) {
		if (this._syncStatus) throw new Error(`[${this}] MemberConfiguration#update cannot execute due to out-of-sync entry.`);
		if (!util.isNumber(amount)) throw new TypeError(`[${this}] MemberConfiguration#update expects a number.`);
		if (amount < 0) throw new TypeError(`[${this}] MemberConfiguration#update expects a positive number.`);
		await (this.UUID
			? this.client.providers.default.db.table('localScores').get(this.UUID).update({ count: amount | 0 })
			: this.client.providers.default.db.table('localScores').insert({ guildID: this.guildID, userID: this.userID, count: amount | 0 })
				.then(result => { [this.UUID] = result.generated_keys; }));
		this.count = amount | 0;

		return this;
	}

	/**
	 * Deletes the member instance from the database
	 * @since 3.0.0
	 */
	async destroy() {
		if (this.UUID) {
			await this.client.providers.default.db.table('localScores').get(this.UUID).delete();
			this.UUID = null;
		}
		this.count = 0;
	}

	/**
	 * toJSON() override for MemberConfiguration
	 * @since 3.0.0
	 * @returns {MemberConfigurationJSON}
	 */
	toJSON() {
		const guild = this.client.guilds.get(this.guildID);
		const member = guild ? guild.members.get(this.userID) : null;

		return {
			guild: guild ? guild.toJSON() : null,
			member: member ? member.toJSON() : null,
			count: this.count
		};
	}

	/**
	 * toString() override for MemberConfiguration
	 * @since 3.0.0
	 * @returns {string}
	 */
	toString() {
		return `MemberConfiguration(${this.guildID}::${this.userID})`;
	}

	_patch(data) {
		if (typeof data.id !== 'undefined') this.UUID = data.id;
		if (typeof data.count === 'number') this.count = data.count;
	}

	/**
	 * Internal sync method
	 * @since 3.0.0
	 * @returns {Promise<this>}
	 * @private
	 */
	async _sync() {
		const data = this.resolveData(await this.client.providers.default.db.table('localScores').getAll([this.guildID, this.userID], { index: 'guild_user' })
			.catch(() => []));

		if (data) {
			this.UUID = data.id;
			this.count = data.count;
		}

		this._syncStatus = null;
		return this;
	}

	resolveData(entries) {
		if (!entries.length) return null;
		if (entries.length === 1) return entries[0];
		const sorted = entries.sort(SORT);
		const [highest] = sorted.splice(0, 1);
		const table = this.client.providers.default.db.table('localScores');
		for (const entry of sorted) {
			this.client.emit('verbose', `[CORRUPTION] [localScores - ${entry.guildID}:${entry.userID}] (${entry.id}) ${entry.count} < ${highest.count}.`);
			table.get(entry.id).delete().run();
		}
		return highest;
	}

}

module.exports = MemberConfiguration;
