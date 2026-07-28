import { Module } from '@nestjs/common'
import { IpfsService } from './ipfs.service'
import { IPFS_PROVIDER_TOKEN } from './ipfs.constants'
import { StorachaProvider } from './providers/storacha.provider'

export { IPFS_PROVIDER_TOKEN }

@Module({
  providers: [
    IpfsService,
    {
      provide: IPFS_PROVIDER_TOKEN,
      useClass: StorachaProvider,
    },
  ],
  exports: [IpfsService],
})
export class IpfsModule {}
