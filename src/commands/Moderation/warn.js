const { ModerationCommand } = require('../../index');

module.exports = class extends ModerationCommand {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['warning'],
			description: (language) => language.get('COMMAND_WARN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_WARN_EXTENDED'),
			modType: ModerationCommand.types.WARN,
			permissionLevel: 5,
			requiredMember: true,
			runIn: ['text'],
			usage: '<SearchMember:user> [reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [target, ...reason]) {
		const member = await this.checkModeratable(msg, target);
		reason = reason.length ? reason.join(' ') : null;

		if (msg.guild.configs.messages.warnings && reason) {
			await member.user.send(msg.language.get('COMMAND_WARN_DM', msg.author.tag, msg.guild, reason))
				.catch(() => null);
		}

		const modlog = await this.sendModlog(msg, target, reason);
		return msg.sendLocale('COMMAND_WARN_MESSAGE', [target, modlog.reason, modlog.caseNumber]);
	}

};
