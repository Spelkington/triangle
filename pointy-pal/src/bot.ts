import {Client, Message} from "discord.js";
import {Command} from "./structs/command";
import {CommandParser} from "./services/commandparser"
import { CourseManager } from "./services/classmanager";

export class Bot
{

    private client : Client = new Client();
    private commandParser : CommandParser = new CommandParser();
    private courseManager : CourseManager = new CourseManager(this.client);

    public listen(): Promise<string>
    {
        
        this.client.on('ready', () => {
            console.log(`Logged in as ${"Somebody!"}!`);

            this.courseManager.initialize(this.client);

            return;
        });

        this.client.on('message', (msg : Message) => {
            console.log(`Message received: ${msg.content}`);

            let command: Command = this.commandParser.parse(msg.content);
            if (!command.instruction)
            {
                console.log("Message was not a command.");
                return;
            }

            command.user = msg.author
            command.channel = msg.channel

            console.log(`Message was a command!`);
            console.log(`\tUser: ${command.user.tag}`);
            console.log(`\tChannel: ${command.channel.id}`)
            console.log(`\tInstruction: ${command.instruction}`);
            console.log(`\tArguments: ${command.arguments}`);

            let success : boolean = false;

            switch (command.instruction)
            {
                case "add-class":
                    success = this.courseManager.command(command);
                    break;

                case "remove-class":
                    success = this.courseManager.command(command);
                    break;
			   
                case "place-in-class":
                    success = this.courseManager.command(command);
                    break;

                default:
                    console.log(`Instruction ${command.instruction} was not recognized.`);
                    success = false;

            }

            if (success)
            {
                msg.channel.send(`${command.user.toString()}'s command recognized! Changes have been made.`)
            }
            else
            {
                msg.channel.send(`${command.user.toString()}'s message was recognized as a command, but no changes have been made.`)
            }

        })

        return this.client.login(process.env.TOKEN)
    }

}
