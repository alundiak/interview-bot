// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { Dialog } = require('botbuilder-dialogs');

const SlotName = 'slot'; // slot-quiz - TODO
const PersistedValues = 'values';

export class SlotFillingDialog extends Dialog {
    /**
     * SlotFillingDialog is a Dialog class for offering slot filling features to a bot.
     * Given multiple slots to fill, the dialog will walk a user through all of them
     * until all slots are filled with user responses.
     * @param {string} dialogId A unique identifier for this dialog.
     * @param {Array} slots An array of SlotDetails that define the required slots.
     */
    constructor(dialogId, slots) {
        super(dialogId);
        this.slots = slots;
    }

    async beginDialog(dc, options) {
        if (dc.context.activity.type !== ActivityTypes.Message) {
            return Dialog.EndOfTurn;
        }

        // Initialize a spot to store these values.
        dc.activeDialog.state[PersistedValues] = {};

        // Call runPrompt, which will find the next slot to fill.
        return await this.runPrompt(dc);
    }

    async continueDialog(dc) {
        // Skip non-message activities.
        if (dc.context.activity.type !== ActivityTypes.Message) {
            return Dialog.EndOfTurn;
        }

        // Call runPrompt, which will find the next slot to fill.
        return await this.runPrompt(dc);
    }

    async resumeDialog(dc, reason, result) {
        // dialogResume is called whenever a prompt or child-dialog completes
        // and the parent dialog resumes.  Since every turn of a SlotFillingDialog
        // is a prompt, we know that whenever we resume, there is a value to capture.

        // console.log("dc.activeDialog.state ", dc.activeDialog.state);

        // The slotName of the slot that was just filled was been stored in the state.
        const slotName = dc.activeDialog.state[SlotName];
        // console.log(slotName);

        // Get the previously persisted values.
        const values = dc.activeDialog.state[PersistedValues];

        // Set the new value into the appropriate slot name.
        values[slotName] = result;

        // AL Approach 1.1
        // console.log(result.values);
        // here is place to decide if answer was CORRECT or not
        // And write int values[]
        values[slotName].abc = 'xyz';
        // but it's kinda bad. If so, then thss "SlotFillingDialog" related Class will contain "business information".
        // Besides, abc field is set on ALL results levels, even on slot. level. 
        // So it's technically not correct
        // AL Approach 1.1

        // Move on to the next slot in the dialog.
        return await this.runPrompt(dc);
    }

    async runPrompt(dc) {
        // runPrompt finds the next slot to fill, then calls the appropriate prompt to fill it.
        const state = dc.activeDialog.state;

        const values = state[PersistedValues];

        // AL: Approach 1
        // console.log('STATE ', state);

        // console.log(Object.keys(values));

        // const filledSlot = this.slots.filter(function(slot) { 
        //     return Object.keys(values).indexOf(slot.name) > -1;
        // });
        // console.log('filledSlot', filledSlot/* filledSlot.length && filledSlot[0].options.expectedAnswer */);
        // AL: Approach 1

        // Find unfilled slots by filtering the full list of slots, excluding those for which we already have a value.
        // code from example
        // const unfilledSlot = this.slots.filter(function(slot) { return !Object.keys(values).includes(slot.name); });
        const unfilledSlot = this.slots.filter(function (slot) {
            return Object.keys(values).indexOf(slot.name) === -1;
        });

        // console.log('unfilledSlot: ', unfilledSlot);

        // If there are unfilled slots still left, prompt for the next one.
        if (unfilledSlot.length) {
            state[SlotName] = unfilledSlot[0].name;
            return await dc.prompt(unfilledSlot[0].promptId, unfilledSlot[0].options);
        } else {
            // If all the prompts are filled, we're done. Return the full state object,
            // which will now contain values for all the slots.
            return await dc.endDialog(dc.activeDialog.state);
        }
    }
}