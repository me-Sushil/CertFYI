import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return { status: 'ok', service: '@certfyi/api' }
  }

  async getPlatformStats() {
    const [totalDocumentsAnchored, totalVerifications] = await Promise.all([
      this.prisma.anchoredDocument.count(),
      this.prisma.verificationLog.count(),
    ])
    return { totalDocumentsAnchored, totalVerifications }
  }
}
