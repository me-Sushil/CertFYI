import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'
import { IpfsService } from './ipfs.service'
import { isValidCid } from './ipfs.utils'
import { ApiErrorDto } from '../common/dto/api-error.dto'
import { IpfsHealthResponseDto, IpfsPinStatusResponseDto } from '../common/dto/ipfs.dto'
import { API_TAGS } from '../common/swagger/swagger.constants'

const EXAMPLE_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'

@ApiTags(API_TAGS.IPFS)
@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfs: IpfsService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Report IPFS configuration',
    description:
      'Shows which storage provider is bound and whether credentials are present. Useful for ' +
      'confirming a deployment can pin before any document is issued.',
  })
  @ApiOkResponse({ description: 'Current IPFS configuration.', type: IpfsHealthResponseDto })
  health(): IpfsHealthResponseDto {
    return {
      provider: this.ipfs.providerName,
      configured: this.ipfs.isConfigured(),
      // Rendered from a placeholder CID so the base URL is visible without
      // exposing any real content.
      gateway: this.ipfs.gatewayUrl('').replace(/\/$/, ''),
    }
  }

  @Get(':cid/status')
  @ApiOperation({
    summary: 'Check whether a CID is retrievable',
    description:
      'Answers the question that matters to a verifier - can this content actually be fetched ' +
      'right now - by probing the configured gateway rather than the pinning API.',
  })
  @ApiParam({ name: 'cid', description: 'IPFS content identifier.', example: EXAMPLE_CID })
  @ApiOkResponse({ description: 'Pin status resolved.', type: IpfsPinStatusResponseDto })
  @ApiBadRequestResponse({ description: 'Malformed CID.', type: ApiErrorDto })
  async status(@Param('cid') cid: string): Promise<IpfsPinStatusResponseDto> {
    this.assertCid(cid)
    const { pinned } = await this.ipfs.status(cid)
    return { cid, pinned, gatewayUrl: this.ipfs.gatewayUrl(cid) }
  }

  @Get(':cid')
  @ApiOperation({
    summary: 'Stream content by CID',
    description:
      'Proxies the configured gateway so the frontend never needs to know which provider is in ' +
      'use. Responses are cached indefinitely - IPFS content is immutable, so a CID can never ' +
      'point at different bytes.',
  })
  @ApiParam({ name: 'cid', description: 'IPFS content identifier.', example: EXAMPLE_CID })
  @ApiProduces('application/octet-stream')
  @ApiOkResponse({ description: 'Content streamed from the gateway.' })
  @ApiBadRequestResponse({ description: 'Malformed CID.', type: ApiErrorDto })
  @ApiNotFoundResponse({ description: 'Gateway could not resolve the CID.', type: ApiErrorDto })
  async fetch(
    @Param('cid') cid: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    this.assertCid(cid)

    let result
    try {
      result = await this.ipfs.fetchFile(cid)
    } catch (error) {
      throw new NotFoundException({
        error: 'Content not retrievable from the IPFS gateway',
        cid,
        detail: error instanceof Error ? error.message : String(error),
      })
    }

    res.set({
      'Content-Type': result.contentType,
      // Content-addressed data cannot change, so this is both safe and free.
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    if (result.contentLength !== undefined) {
      res.set({ 'Content-Length': String(result.contentLength) })
    }

    return new StreamableFile(result.stream)
  }

  private assertCid(cid: string): void {
    if (!isValidCid(cid)) {
      throw new NotFoundException({ error: 'Malformed CID', cid })
    }
  }
}
