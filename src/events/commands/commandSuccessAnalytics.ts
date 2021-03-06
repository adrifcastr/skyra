import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';
import { Command, Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.CommandSuccess })
export default class extends Event {
	public run(_message: Message, command: Command) {
		this.context.client.emit(Events.CommandUsageAnalytics, command.name, command.category, command.subCategory);
	}
}
