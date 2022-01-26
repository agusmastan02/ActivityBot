const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class OrderDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'orderDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.pizzaStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If a pizza type has not been provided, prompt for one.
     */
    async pizzaStep(stepContext) {
        const orderDetails = stepContext.options;

        if (!orderDetails.type.pizzaType) {
            const messageText = 'Qué tipo de pizza te gustaria?';
            const msg = MessageFactory.text(messageText, 'Qué tipo de pizza te gustaria?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(orderDetails.type.pizzaType);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const orderDetails = stepContext.options;

        // Capture the results of the previous step
        orderDetails.type = stepContext.result;
        const messageText = `Por favor confirma la orden por: ${ orderDetails.type }.\nEsta correcto?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const orderDetails = stepContext.options;
            return await stepContext.endDialog(orderDetails);
        }
        return await stepContext.endDialog();
    }

}

module.exports.OrderDialog = OrderDialog;