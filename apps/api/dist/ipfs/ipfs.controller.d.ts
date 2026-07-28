import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { IpfsService } from './ipfs.service';
import { IpfsHealthResponseDto, IpfsPinStatusResponseDto } from '../common/dto/ipfs.dto';
export declare class IpfsController {
    private readonly ipfs;
    constructor(ipfs: IpfsService);
    health(): IpfsHealthResponseDto;
    status(cid: string): Promise<IpfsPinStatusResponseDto>;
    fetch(cid: string, res: Response): Promise<StreamableFile>;
    private assertCid;
}
