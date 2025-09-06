import { makeAutoObservable } from "mobx";
import exchangeController from "./exchange-controller";


class ChatController {

    message: string | undefined

    constructor() {
        makeAutoObservable(this)
    }

    async sendMessage() {
        if (this.message) {
            const msg = this.message
            this.message = ''
            await exchangeController.sendMessageToAI(msg)
        } else {
            throw new Error('message not set')
        }
    }

    setMessage(message: string) {
        this.message = message
    }

}

export default new ChatController()