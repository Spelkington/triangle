import {Command} from "../structs/command";

export class CommandParser
{

    private regexp : RegExp = new RegExp("^!pal.*$");

    public parse(str : string) : Command
    {

        let result: Command = {} as any;

        // Return an empty command if the result wasn't a command
        if (!this.regexp.exec(str))
        {
            return result;
        }

        let tokens: string[] = str.split(' ');

        // Shift the !pal tag from the tokens
        tokens.shift();

        // If no other arguments were given, interpret it as a help request
        if (tokens.length == 0)
        {
            tokens.unshift("help");
        }

        // Set the instruction to the first token, then remove the token
        result.instruction = tokens[0];
        tokens.shift();

        // Set the arguments to the rest of the tokens
        result.arguments = tokens;

        return result;

    }

}