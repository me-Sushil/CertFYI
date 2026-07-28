import { Module } from '@nestjs/common'
import { IpfsController } from './ipfs.controller'
import { IPFS_PROVIDER } from './ipfs.constants'
import { IpfsService } from './ipfs.service'
import { PinataProvider } from './providers/pinata.provider'

/**
 * Binds a concrete storage provider to the IpfsProvider port.
 *
 * Swapping providers, or pinning to a second one for the redundancy SRS §12
 * asks for, is a change to this binding only - nothing outside this folder
 * references PinataProvider.
 */
@Module({
  controllers: [IpfsController],
  providers: [IpfsService, { provide: IPFS_PROVIDER, useClass: PinataProvider }],
  exports: [IpfsService],
})
export class IpfsModule {}
