export declare class PromptService {
    private cachePrompt;
    constructor();
    getMessages(query: string): {
        role: string;
        content: string;
    }[];
}
