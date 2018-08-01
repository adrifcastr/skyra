const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 5,
			description: (language) => language.get('COMMAND_FILTER_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FILTER_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|reset|show> [word:string]',
			usageDelim: ' '
		});
	}

	async add(msg, [word]) {
		if (!word) throw msg.language.get('COMMAND_FILTER_UNDEFINED_WORD');
		word = word.toLowerCase();
		if (msg.guild.configs.filter.raw.includes(word)) throw msg.language.get('COMMAND_FILTER_FILTERED', true);
		await msg.guild.configs.update('filter.raw', word, { action: 'add' });
		msg.guild.configs.updateFilter();
		return msg.sendLocale('COMMAND_FILTER_ADDED', [word]);
	}

	async remove(msg, [word]) {
		if (!word) throw msg.language.get('COMMAND_FILTER_UNDEFINED_WORD');
		word = word.toLowerCase();
		if (!msg.guild.configs.filter.raw.includes(word)) throw msg.language.get('COMMAND_FILTER_FILTERED', false);
		if (msg.guild.configs.filter.raw.length === 1) return this.reset(msg);
		await msg.guild.configs.update('filter.raw', word, { action: 'remove' });
		msg.guild.configs.updateFilter();
		return msg.sendLocale('COMMAND_FILTER_REMOVED', [word]);
	}

	async reset(msg) {
		await msg.guild.configs.reset('filter.raw');
		msg.guild.configs.filter.regexp = null;
		return msg.sendLocale('COMMAND_FILTER_RESET');
	}

	show(msg) {
		const { raw } = msg.guild.configs.filter;
		return msg.sendMessage(!raw.length
			? msg.language.get('COMMAND_FILTER_SHOW_EMPTY')
			: msg.language.get('COMMAND_FILTER_SHOW', `\`${raw.join('`, `')}\``));
	}

};
