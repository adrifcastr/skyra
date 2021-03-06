import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Duration } from '@sapphire/time-utilities';
import { isNumber } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: Message) {
		const duration = new Duration(arg);

		if (duration.offset <= 0 || !isNumber(duration.fromNow.getTime())) {
			throw await message.resolveKey(LanguageKeys.Resolvers.InvalidDuration, { name: possible.name });
		}

		const { min, max } = possible;

		return (await Argument.minOrMax(duration.offset, min, max, possible, message, '')) ? duration.offset : null;
	}
}
