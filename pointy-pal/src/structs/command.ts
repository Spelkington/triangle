import {User, Channel} from "discord.js"

export interface Command {
    user: User;
    channel: Channel;
    instruction: string;
    arguments:   string[]
}