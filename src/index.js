'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var countriez = require('./countries');



exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = this.t("WELCOME_MESSAGE", this.t("SKILL_NAME"));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = this.t("WELCOME_REPROMT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'IndexIntent': function () {
        var countrySlot = this.event.request.intent.slots.country;
        var countryName;
        if (countrySlot && countrySlot.value) {
            countryName = countrySlot.value;
        }

        var cardTitle = this.t("DISPLAY_CARD_TITLE", this.t("SKILL_NAME"), countryName);
        var countries = this.t("COUNTRIES");
        var index = countries[countryName];

        if (index) {
            var speechOutput = "The safety index of " + countryName + " is " + index
            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = this.t("COUNTRY_REPEAT_MESSAGE");
            this.emit(':askWithCard', speechOutput, this.attributes['repromptSpeech'], cardTitle, speechOutput);
        } else {
            var speechOutput = this.t("COUNTRY_NOT_FOUND_MESSAGE");
            var repromptSpeech = this.t("COUNTRY_NOT_FOUND_REPROMPT");
            if (countryName) {
                speechOutput += this.t("COUNTRY_NOT_FOUND_WITH_ITEM_NAME", countryName);
            } else {
                speechOutput += this.t("COUNTRY_NOT_FOUND_WITHOUT_ITEM_NAME");
            }
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'ComparisonIntent': function() {
        var firstCountrySlot = this.event.request.intent.slots.countryOne;
        var secondCountrySlot = this.event.request.intent.slots.countryTwo;
        var firstCountryName; var secondCountryName;
        if (firstCountrySlot && firstCountrySlot.value) {
            firstCountryName = firstCountrySlot.value;
        }
        if (secondCountrySlot && secondCountrySlot.value) {
            secondCountryName = secondCountrySlot.value;
        }

        var countries = this.t("COUNTRIES");
        var firstIndex = countries[firstCountryName];
        var secondIndex = countries[secondCountryName];

        if (firstIndex && secondIndex) {
            var speechOutput;
            if (firstCountryName == secondCountryName) {
                speechOutput = "Please provide different countries to compare."
            } else if (firstIndex > secondIndex) {
                speechOutput = this.t("COMPARISON", firstCountryName, firstIndex, secondCountryName, secondIndex)
            } else {
                speechOutput = this.t("COMPARISON", secondCountryName, secondIndex, firstCountryName, firstIndex)
            } 
            this.attributes['speechOutput'] = speechOutput
            this.attributes['repromptSpeech'] = this.t("COUNTRY_REPEAT_MESSAGE");
            this.emit(':ask', speechOutput, this.attributes['repromptSpeech'])
        } else {
            var speechOutput = this.t("COUNTRY_NOT_FOUND_MESSAGE");
            if (!firstCountryName || !secondCountryName) {
                if (!firstCountryName && !secondCountryName) {
                    speechOutput += " either country. ";
                } else if (!firstCountryName) {
                    speechOutput += "what to comapre against " + secondCountryName + ". ";
                } else {
                    speechOutput += "what to compare against " + firstCountryName + ". ";
                }
            } else {
                if (!firstIndex && !secondIndex) {
                    speechOutput += "either index. "
                } else if (!firstIndex) {
                    speechOutput += firstCountryName + " index. "
                } else {
                    speechOutput += secondCountryName + " index. "
                }
            }
            var repromptSpeech = this.t("COUNTRY_NOT_FOUND_REPROMPT");
            speechOutput += repromptSpeech;

            this.attributes['speechOutput'] = speechOutput;
            this.attributes['repromptSpeech'] = repromptSpeech;

            this.emit(':ask', speechOutput, repromptSpeech);
        }
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {
        // Get a random space fact from the space facts list
        // Use this.t() to get corresponding language data
        var factArr = this.t('FACTS');
        var factIndex = Math.floor(Math.random() * factArr.length);
        var randomFact = factArr[factIndex];

        // Create speech output
        var speechOutput = this.t("GET_FACT_MESSAGE") + randomFact;
        this.emit(':tellWithCard', speechOutput, this.t("SKILL_NAME"), randomFact)
    },
    'WhoUseIntent' : function() {
        this.emit(':tell', this.t("WHOW_USE"))
    },
    'HowManyIntent' : function() {
        this.emit(':tell', this.t("HOW_MANY"))
    },
    'FoundingIntent': function() {
        this.emit(':tell', this.t("FOUNDING"))
    },
    'BasicInfoIntent': function() {
        this.emit(':tell', this.t("BASIC_INFO"))
    },
    'MaximumIntent': function() {
        this.emit(':tell', this.t("MAXIMUM"))
    },
    'MinimumIntent': function() {
        this.emit(':tell', this.t("MINIMUM"))
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t("HELP_MESSAGE");
        this.attributes['repromptSpeech'] = this.t("HELP_REPROMT");
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};

var languageStrings = {
    'en-US': {
        translation: {
            COUNTRIES: countriez.INDEX_EN_US,
            SKILL_NAME: 'UL Index Helper',
            WELCOME_MESSAGE: "Welcome to %s. You can ask a question like, what\'s the index of France? ... Now, what can I help you with.",
            WELCOME_REPROMT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s  - index for %s.',
            HELP_MESSAGE: "You can ask questions such as, what\'s the index, or, you can say exit...Now, what can I help you with?",
            HELP_REPROMT: "You can say things like, what\'s the index, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            COUNTRY_REPEAT_MESSAGE: 'Try saying repeat.',
            COUNTRY_NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know ",
            COUNTRY_NOT_FOUND_WITH_ITEM_NAME: 'the index for %s. ',
            COUNTRY_NOT_FOUND_WITHOUT_ITEM_NAME: 'that country. ',
            COUNTRY_NOT_FOUND_REPROMPT: 'What else can I help with?',
            COMPARISON: "The safety index of %s is %s, which is greater than %s with a safety index of %s.",
            BASIC_INFO: "The UL Safety Index is a data science initiative intended to increase the global awareness of health, security, sustainability and safety through information, dialog and collaboration. Through engagement with partners throughout the world, their vision is to advance safe living and working environments for people everywhere by providing better data and metrics to guide decision making and investments.",
            FOUNDING: "The UL Safety Index was founded on Spetember 19th, 2016.",
            WHO_USE: "The UL Safety Index is used by policy makers, consumers, businesses, and other stakeholders to make decisions about safety issues and seek a common goal of improving safety. It can even be used by you! Just ask me how.",
            HOW_MANY: "Nearly one hundred ninety countries are represented in the UL Safety Index database.",
            MAXIMUM: "The country with the highest safety index is the Netherlands with a rating of 95.39.",
            MINIMUM: "The country with the lowest safety index is South Sudan with a rating of 21.46.",
            GET_FACT_MESSAGE : "Here's how you can help: ",
            FACTS : [
               "One great way to use the UL Safety Index is to know about the factors that impact safety. For example, one  key driver of the UL Safety Index is the wealth of a country and so the more that policy makers and businesses can increase the wealth of a nation there will be a boost in safety.",
               "Being aware of the factors that impact safety is a great way to use the UL Safety Index. One factor is the technology of a country.  Technology can be used to increase safety and be a vigilant protector to avoid injuries.",
               "Education is one of the crucial factors for using the UL Safety Index. Policy makers and other stakeholders should learn about how safety can be increased for the general public and then pursue government policies and regulations supporting safety.",
               "A notable way to use the UL Safety Index is by having businesses adopt standards that promote safer systems and devices that are put into use. The establishment of consumer protections is also important to enhance safety.",
               "In addition to using the UL Safety Index for making a safer environment, safety professionals can help improve safety by being aware of the dangers due to exposure to mechanical forces, and can help design systems to avoid injuries by foreign bodies.",
            ],
        },
    },
};




