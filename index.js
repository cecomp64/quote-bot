//Initialize Bot and login
require('dotenv').config();
const Discord = require('discord.js');
const mysql = require('mysql');

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const MYSQLHOST = process.env.MYSQLHOST;
const MYSQLUSER = process.env.MYSQLUSER;
const MYSQLPASS = process.env.MYSQLPASS;
const MYSQLDATABASE = process.env.MYSQLDATABASE;

bot.login(TOKEN);

var con = mysql.createConnection({
     host: MYSQLHOST,
     user: MYSQLUSER,
     password: MYSQLPASS,
     database: MYSQLDATABASE
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database!");
});

bot.on('ready', () => {
  	console.log(`Logged in as ${bot.user.tag}!`);
});


//Wait for message triggers
bot.on('message', msg => {
     var command = parseCommand(msg.content)[0];
     switch(command){
          case "!add":
               console.log("Current Command: "+command);
               if(checkUser(msg))
               {
                    addQuote(msg);
               }
               break;

          case "!quote":
               console.log("Current Command: "+command);
               quote = generateRandomQuote();
               msg.reply(quote);
               break;

          case "!help":
               console.log("Current Command: "+command);
               msg.channel.send(usage());
               break;
     }
});


//Functions
function parseCommand(msg)
{
     var command = msg.split(' ', 1);
     return command;
}

function checkUser(msg)
{
     var returnFlag = true;
     var user = msg.member.user.id;
     var sql = "SELECT * FROM user WHERE user_id = "+msg.member.user.id+" limit 1;";

     con.query(sql, returnFlag = function (err, result) {
          if (err)
          {
               console.log("\tError in DB Checking User");
               return false;
          }
          else
          {
               if(result.length)
               {
                    console.log("\t"+msg.member.user.tag+" already in db");
                    return true;
               }
               else
               {
                    if(addUser(msg))
                    {
                         return true;
                    }
                    else
                    {
                         console.log("\tError Adding User to Db");
                         returnFlag = 0;
                         return false;
                    }
               }
          }
     });
     return returnFlag;
}

function addUser(msg)
{
     var returnFlag = true;
     var id = msg.member.user.id;
     var user = msg.member.user.username;
     var sql = "INSERT INTO user (user_id, name) VALUES ('"+id+"','"+user+"')";
     con.query(sql, returnFlag = function (err, result) {
          if (err)
          {
               console.log("\tError in DB Adding User");
               return false;
          }
          else
          {
               console.log("\t"+msg.member.user.tag+" Added to DB!")
               return true;
          }
     });
     return returnFlag;
}

function addQuote(msg, msgInfo)
{
     var returnFlag = false;
     var parsedQuote = msg.content.match("\"[^\"]*\"{0,1}");     //parses anything between first two quotation marks
     var parsedAuthor = msg.content.match("(?<=-)[^-].*");        //parses anything after a dash, excludes any new lines
     var id = msg.member.user.id;
     var channel = msg.channel.name;

     if(parsedQuote === null || parsedAuthor === null)
     {
          console.log("\tImproper format, quote could not be added.");
          msg.reply("Sorry! I am unable to add your quote.  Please make sure to use the !add \"Quote\" -Author format!");
          return false;
     }

     var sql = "SELECT * FROM quote WHERE quote = "+parsedQuote+" limit 1;";

     con.query(sql, function (err, result) {
          if (err)
          {
               console.log("\tError in DB Checking Quote");
               returnFlag = true;
          }
          else
          {
               if(result.length)
               {
                    msg.reply("Sorry! Your submitted quote is already in the database.");
                    console.log("\tQuote is already in the db");
                    returnFlag = true;
               }
          }
     });

     console.log("return flag: "+returnFlag);
     if(returnFlag)
          return false;

     sql = "INSERT INTO quote (quote, user_id, channel, author) VALUES ("+parsedQuote+","+id+", '"+channel+"', '"+parsedAuthor+"')";
     con.query(sql, function (err, result) {
          if (err)
          {
               console.log(err);
               console.log("\tError in Db Adding Quote");
               returnFlag = true;
          }
          else
          {
               console.log("\t"+msg.member.user.tag+" Added a quote to the DB!")
          }
     });

     if(returnFlag)
          return false;

     sql = "UPDATE user SET no_of_quotes = no_of_quotes + 1 WHERE user_id LIKE '"+id+"' ";
     con.query(sql, function (error, row){
          if (error)
          {
               console.log("\tError Adding quote to user");
          }
     });
     return true;
}

function usage()
{
	return "!quote\t:\tfind a random quote \n\n!quote<user>\t:\tfind a random quote from a specific user\n\n!quote<user><search>\t:\tsearch for a specific quote";
};

function generateRandomQuote()		//return a random quote from the db
{
	var quote = 'Thorn has a nice bum';
	return quote;
};

function quoteUser(user)		//return a random quote from a specific user
{

};

function findQuote(user, partialMsg)	//searches through db for a specific quote by a user
{

};

function topQuote()			//returns the highest ranking quote
{

};
