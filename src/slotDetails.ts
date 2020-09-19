// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export class SlotDetails {
    name: any;
    promptId: any;
    rePromptMessage: string;
    options: {
        prompt: any,
        choices: any,
        expectedAnswer: any,
        retryPrompt: any
    };

    /**
     * SlotDetails is a small class that defines a "slot" to be filled in a SlotFillingDialog.
     * @param {string} name The field name used to store user's response.
     * @param {string} promptId A unique identifier of a Dialog or Prompt registered on the DialogSet.
     * @param {any} prompt The text of the prompt presented to the user.
     * @param {string} choices quiz question proposed answers.
     * @param {string} expectedAnswer quiz question expected answer.
     */
    constructor(name: string, promptId: string, prompt: any, choices: Array<string>, expectedAnswer: string) {
        this.name = name;
        this.promptId = promptId;
        this.rePromptMessage = 'You must answer a question by clicking one of proposed variants.';

        if (prompt) {
            this.options = {
                prompt: prompt,
                choices: choices,
                expectedAnswer: expectedAnswer,
                retryPrompt: this.rePromptMessage
            };
        } else {
            this.options = prompt;
        }
    }
}