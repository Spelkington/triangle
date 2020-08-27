import {PermissionOverwrites, GuildChannel, CategoryChannel, User, Client, ChannelData, Guild, PermissionOverwriteOptions} from "discord.js"
import {Command} from "../structs/command";
import fs from 'fs';

export class CourseManager
{

    private departments : string[];
    private client : Client;

    private commandGuild : Guild;
    private commandChannel : GuildChannel;
    private departmentCat : CategoryChannel;
    private coursesCat : CategoryChannel;

    private currentlyAdding : boolean = false;


    constructor(client: Client)
    {
        this.client = client
        
        let text : string = fs.readFileSync("./resources/departments.txt", "utf8");
        this.departments = text.split('\n');
        console.log(`CourseManager: Departments Loaded (${this.departments.length} departments)`);

        this.commandGuild = null!;
        this.commandChannel = null!;
        this.departmentCat = null!;
        this.coursesCat = null!;

    }

    public initialize(client : Client)
    {

        let guildId : string = String(process.env.GUILD_ID);
        client.guilds.fetch(guildId).then((guild : Guild) => {

            this.commandGuild = guild;

            let channelId : string = String(process.env.COURSE_MANAGEMENT_ID);
            this.commandChannel = <GuildChannel>this.commandGuild.channels.cache.get(channelId);

            let departmentId : string = String(process.env.DEPARTMENT_CATEGORY_ID);
            this.departmentCat = <CategoryChannel>this.commandGuild.channels.cache.get(departmentId);

            let courseId : string = String(process.env.COURSE_CATEGORY_ID);
            this.coursesCat = <CategoryChannel>this.commandGuild.channels.cache.get(courseId);

            console.log("CourseManager Initialized!")
            console.log(`\tGuild: ${this.commandGuild.name}`)
            console.log(`\tCommand Channel: ${this.commandChannel.name}`)
            console.log(`\tCourses Category: ${this.coursesCat.name}`)
            console.log(`\tDepartments Category: ${this.departmentCat.name}`)

        }).catch((error) => {

            throw new Error("CourseManager could not load guild!")

        })

    }

    public command(command : Command)
    {
        let changes : number = 0;

        if (command.channel.id != this.commandChannel.id) {
            console.log("Message was not in the correct channel.")
            return;
        }

        switch (command.instruction) {

            case "add-class":
                changes = this.addCourses(command.user, command.arguments)
                break;

            case "remove-class":
                changes = this.removeCourses(command.user, command.arguments)
                break;

            default:
                break;
        }

        console.log(`Changes made: ${changes}`)

        return;
    }

    private validateCourse(course: string) : boolean
    {
        // Use Regular Expression to split courses into alpha and numeric character groups
        // e.g. BUS1010 = ['BUS', '1010']
        let parts: string[] = course.match(/[a-z]+|[^a-z]+/gi) || [];
        
        console.log(`Course parts: ${parts}`);

        if (parts.length != 2) // If the course has more than two parts (two alpha-numerical groups)
        {
            return false;
        }
        else if (parts[1].length != 4) // If the course number isn't 4 numbers
        {
            return false;
        }
        else if (!this.departments.find((str : string) => str.toUpperCase() === parts[0].toUpperCase()))
        // If the course department doesn't exist
        {
            return false;
        }

        return true;
    }

    private addCourse(user : User, course: string) : number
    {
        console.log(`Adding ${user.tag} to course ${course}`);

        let isValid : boolean = this.validateCourse(course);
        console.log(`\tValidity of ${course}: ${isValid}`)

        // If it's not valid, return zero changes
        if (!isValid)
        {
            return 0;
        }

        // Determine the names for the three necessary channels
        let textChatName = course.toLowerCase();
        let voiceChatName = course.toUpperCase();
        let departmentChatName = (<string[]>course.match(/[a-z]+|[^a-z]+/gi))[0].toLowerCase();

        let channels = [
            [course.toLowerCase(), "text", this.coursesCat],
            [course.toUpperCase(), "voice", this.coursesCat],
            [(<string[]>course.match(/[a-z]+|[^a-z]+/gi))[0].toLowerCase(), "text", this.departmentCat]
        ];

        for (let channelDetail of channels)
        {

            console.log(`\tAttempting to add user to ${channelDetail[0]}`)

            let name : string = channelDetail[0] as string;
            let type : "text" | "voice" = channelDetail[1] as "text" | "voice";
            let cat : CategoryChannel = channelDetail[2] as CategoryChannel;

            // CHECK IF CHANNEL EXISTS
            let channel : GuildChannel | undefined = cat.children.find((channel : GuildChannel) => {
                //console.log(`Comparing ${channel.name} to ${name}`);
                return channel.name === name;
            });

            if (!channel)
            {
                console.log(`\t${channelDetail[0]} did not exist! Creating...`);

                // this.createChannel(
                //     <string>channelDetail[0],
                //     <"text" | "voice">channelDetail[1], 
                //     <CategoryChannel>channelDetail[2]
                // ).then((channel : GuildChannel) => {
                //     this.addUserToChannelView(user, channel);
                // });

                this.commandGuild.channels.create(name, {
                    "type": type

                }).then((channel: GuildChannel) => {
                    
                    channel.setParent(cat).then(() => {

                        this.addUserToChannelView(user, channel);

                    });

                });

                // I would like to have a channel by now!

            }
            else
            {
                this.addUserToChannelView(user, channel!);
            }


        }

        return 1;
    }

    //private async createChannel(name : string,
    //                      type : "text" | "voice",
    //                      category : CategoryChannel) : Promise<GuildChannel>
    //{

    //    let channelData : ChannelData = {} as any;
    //    channelData.name = name;
    //    channelData.parentID = category.id;

    //    let actualChannel = await this.commandGuild.channels.create(name, {
    //        "type": type
    //    }).then((newChannel : GuildChannel) => {

    //        newChannel.setParent(category);

    //    }).catch((error) => {

    //        console.log(`error while creating ${name}. Deleting...`)
    //        throw error;

    //    });

    //    return <GuildChannel>actualChannel;

    //}

    private addUserToChannelView(user: User, channel : GuildChannel)
    {
        channel.updateOverwrite(user.id, {VIEW_CHANNEL: true});
    }

    private addCourses(user: User, courses: string[]) : number
    {

        let changes = 0

        // TODO: Properly sanitize multi input. Until then, only add the first course.
        // for (let course of courses) {
        //     changes += this.addCourse(user, course);
        // }


        if (courses.length < 1)
        {
            return changes;
        }

        changes += this.addCourse(user, courses[0])

        return changes;
    }

    private removeCourse(user : User, course: string) : number
    {
        console.log(`Adding ${user.tag} to course ${course}`);

        return 1;
    }

    private removeCourses(user : User, courses : string[]) : number
    {

        let changes = 0

        for (let course of courses) {
            changes += this.removeCourse(user, course);
        }

        return changes;
    }

}