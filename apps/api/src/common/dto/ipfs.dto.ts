import { ApiProperty } from '@nestjs/swagger'

const EXAMPLE_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'

export class IpfsPinStatusResponseDto {
  @ApiProperty({ description: 'Content identifier that was checked.', example: EXAMPLE_CID })
  cid!: string

  @ApiProperty({
    description: 'Whether the content is currently retrievable from the configured gateway.',
    example: true,
  })
  pinned!: boolean

  @ApiProperty({
    description: 'Public URL the content can be fetched from.',
    example: `https://gateway.pinata.cloud/ipfs/${EXAMPLE_CID}`,
  })
  gatewayUrl!: string
}

export class IpfsHealthResponseDto {
  @ApiProperty({ description: 'Bound storage provider.', example: 'pinata' })
  provider!: string

  @ApiProperty({
    description: 'Whether credentials are present. When false, pinning is skipped and CIDs are null.',
    example: true,
  })
  configured!: boolean

  @ApiProperty({
    description: 'Gateway used to build public URLs.',
    example: 'https://gateway.pinata.cloud/ipfs',
  })
  gateway!: string
}
