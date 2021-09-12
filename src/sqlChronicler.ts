import { IChronicler, IDataEvent, IFormatSettings, IJsonSerializable, IStatusEvent } from '@curium.rocks/data-emitter-base';

/**
 * 
 */
export class SqlChronicler implements IChronicler {
    /**
     * Id of the chronicler
     */
    id: string;
    /**
     * Name of the chronicler
     */
    name: string;

    /**
     * Description of the chronicler
     */
    description: string;

    /**
     * 
     * @param {string} id 
     * @param {string} name 
     * @param {string} description 
     */
    constructor(id: string, name: string, description: string){
        this.id = id;
        this.name = name;
        this.description = description;
    }

    /**
     * 
     */
    disposeAsync(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     * 
     * @param {IJsonSerializable|DataEvent|IStatusEvent} record 
     */
    saveRecord(record: IJsonSerializable|IDataEvent|IStatusEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     * 
     * @param {IFormatSettings} settings 
     */
    serializeState(settings: IFormatSettings): Promise<string> {
        throw new Error('Method not implemented.');
    }

}