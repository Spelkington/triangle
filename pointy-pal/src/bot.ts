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

            switch (command.instruction)
            {
                case "add-class":
                    this.courseManager.command(command);
                    break;

                case "remove-class":
                    this.courseManager.command(command);
                    break;

                default:
                    console.log(`Instruction ${command.instruction} was not recognized.`);
            }

        })

        return this.client.login(process.env.TOKEN)
    }

}