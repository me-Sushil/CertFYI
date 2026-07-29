import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHealth(): {
        status: string;
        service: string;
    };
    getStats(): Promise<{
        totalDocumentsAnchored: number;
        totalVerifications: number;
    }>;
}
