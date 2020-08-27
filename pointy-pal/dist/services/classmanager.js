"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseManager = void 0;
var fs_1 = __importDefault(require("fs"));
var CourseManager = /** @class */ (function () {
    function CourseManager(client) {
        this.currentlyAdding = false;
        this.client = client;
        var text = fs_1.default.readFileSync("./resources/departments.txt", "utf8");
        this.departments = text.split('\n');
        console.log("CourseManager: Departments Loaded (" + this.departments.length + " departments)");
        this.commandGuild = null;
        this.commandChannel = null;
        this.departmentCat = null;
        this.coursesCat = null;
    }
    CourseManager.prototype.initialize = function (client) {
        var _this = this;
        var guildId = String(process.env.GUILD_ID);
        client.guilds.fetch(guildId).then(function (guild) {
            _this.commandGuild = guild;
            var channelId = String(process.env.COURSE_MANAGEMENT_ID);
            _this.commandChannel = _this.commandGuild.channels.cache.get(channelId);
            var departmentId = String(process.env.DEPARTMENT_CATEGORY_ID);
            _this.departmentCat = _this.commandGuild.channels.cache.get(departmentId);
            var courseId = String(process.env.COURSE_CATEGORY_ID);
            _this.coursesCat = _this.commandGuild.channels.cache.get(courseId);
            console.log("CourseManager Initialized!");
            console.log("\tGuild: " + _this.commandGuild.name);
            console.log("\tCommand Channel: " + _this.commandChannel.name);
            console.log("\tCourses Category: " + _this.coursesCat.name);
            console.log("\tDepartments Category: " + _this.departmentCat.name);
        }).catch(function (error) {
            throw new Error("CourseManager could not load guild!");
        });
    };
    CourseManager.prototype.command = function (command) {
        var changes = 0;
        if (command.channel.id != this.commandChannel.id) {
            console.log("Message was not in the correct channel.");
            return;
        }
        switch (command.instruction) {
            case "add-class":
                changes = this.addCourses(command.user, command.arguments);
                break;
            case "remove-class":
                changes = this.removeCourses(command.user, command.arguments);
                break;
            default:
                break;
        }
        console.log("Changes made: " + changes);
        return;
    };
    CourseManager.prototype.validateCourse = function (course) {
        // Use Regular Expression to split courses into alpha and numeric character groups
        // e.g. BUS1010 = ['BUS', '1010']
        var parts = course.match(/[a-z]+|[^a-z]+/gi) || [];
        console.log("Course parts: " + parts);
        if (parts.length != 2) // If the course has more than two parts (two alpha-numerical groups)
         {
            return false;
        }
        else if (parts[1].length != 4) // If the course number isn't 4 numbers
         {
            return false;
        }
        else if (!this.departments.find(function (str) { return str.toUpperCase() === parts[0].toUpperCase(); })) 
        // If the course department doesn't exist
        {
            return false;
        }
        return true;
    };
    CourseManager.prototype.addCourse = function (user, course) {
        var _this = this;
        console.log("Adding " + user.tag + " to course " + course);
        var isValid = this.validateCourse(course);
        console.log("\tValidity of " + course + ": " + isValid);
        // If it's not valid, return zero changes
        if (!isValid) {
            return 0;
        }
        // Determine the names for the three necessary channels
        var textChatName = course.toLowerCase();
        var voiceChatName = course.toUpperCase();
        var departmentChatName = course.match(/[a-z]+|[^a-z]+/gi)[0].toLowerCase();
        var channels = [
            [course.toLowerCase(), "text", this.coursesCat],
            [course.toUpperCase(), "voice", this.coursesCat],
            [course.match(/[a-z]+|[^a-z]+/gi)[0].toLowerCase(), "text", this.departmentCat]
        ];
        var _loop_1 = function (channelDetail) {
            console.log("\tAttempting to add user to " + channelDetail[0]);
            var name_1 = channelDetail[0];
            var type = channelDetail[1];
            var cat = channelDetail[2];
            // CHECK IF CHANNEL EXISTS
            var channel = cat.children.find(function (channel) {
                //console.log(`Comparing ${channel.name} to ${name}`);
                return channel.name === name_1;
            });
            if (!channel) {
                console.log("\t" + channelDetail[0] + " did not exist! Creating...");
                // this.createChannel(
                //     <string>channelDetail[0],
                //     <"text" | "voice">channelDetail[1], 
                //     <CategoryChannel>channelDetail[2]
                // ).then((channel : GuildChannel) => {
                //     this.addUserToChannelView(user, channel);
                // });
                this_1.commandGuild.channels.create(name_1, {
                    "type": type
                }).then(function (channel) {
                    channel.setParent(cat).then(function () {
                        _this.addUserToChannelView(user, channel);
                    });
                });
                // I would like to have a channel by now!
            }
            else {
                this_1.addUserToChannelView(user, channel);
            }
        };
        var this_1 = this;
        for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
            var channelDetail = channels_1[_i];
            _loop_1(channelDetail);
        }
        return 1;
    };
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
    CourseManager.prototype.addUserToChannelView = function (user, channel) {
        channel.updateOverwrite(user.id, { VIEW_CHANNEL: true });
    };
    CourseManager.prototype.addCourses = function (user, courses) {
        var changes = 0;
        // TODO: Properly sanitize multi input. Until then, only add the first course.
        // for (let course of courses) {
        //     changes += this.addCourse(user, course);
        // }
        if (courses.length < 1) {
            return changes;
        }
        changes += this.addCourse(user, courses[0]);
        return changes;
    };
    CourseManager.prototype.removeCourse = function (user, course) {
        console.log("Adding " + user.tag + " to course " + course);
        return 1;
    };
    CourseManager.prototype.removeCourses = function (user, courses) {
        var changes = 0;
        for (var _i = 0, courses_1 = courses; _i < courses_1.length; _i++) {
            var course = courses_1[_i];
            changes += this.removeCourse(user, course);
        }
        return changes;
    };
    return CourseManager;
}());
exports.CourseManager = CourseManager;
//# sourceMappingURL=classmanager.js.map