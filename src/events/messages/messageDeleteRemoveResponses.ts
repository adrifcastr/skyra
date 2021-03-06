import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.MessageDelete })
export default class extends Event {
	public async run(message: Message) {
		for (const response of message.responses) {
			await response.nuke();
		}
	}
}
